import * as cartRepository from "../../cart/cart.repository.js";
import * as customerService from "../../customer/customer.service.js";
import * as conversationService from "../conversation.service.js";
import * as orderService from "../../order/order.service.js";
import * as settingsRepository from "../../settings/settings.repository.js";

import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import {
  formatCurrency,
  getPaymentMethodLabel,
  validateSelectedPaymentMethod,
} from "../payment.helper.js";
import { ButtonAction } from "../engine/command.constants.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

const loadCheckoutSettings = async (restaurantId) => {
  try {
    const checkoutSettings =
      await settingsRepository.getCheckoutSettings(restaurantId);

    if (!checkoutSettings?.settings) {
      console.error("Checkout settings are missing for restaurant.", {
        restaurantId,
      });
      return null;
    }

    return checkoutSettings;
  } catch (error) {
    console.error("Failed to load checkout settings.", {
      restaurantId,
      error: error?.message,
    });
    return null;
  }
};

const returnToPaymentSelection = async (
  conversation,
  phoneNumber,
  notice,
) => {
  await conversationService.setPaymentMethod(conversation.id, null);
  await goToState(conversation, ConversationState.CHECKOUT_PAYMENT);

  const checkoutPaymentState = await import("./checkout-payment.state.js");

  return checkoutPaymentState.show(conversation, phoneNumber, notice);
};

const isCheckoutAvailable = (checkoutSettings) =>
  checkoutSettings?.isOpen === true &&
  checkoutSettings.settings.orderAcceptanceEnabled === true;

export const show = async (conversation, phoneNumber) => {
  const latestConversation = await conversationService.getConversationById(
    conversation.id,
  );

  const checkoutSettings = await loadCheckoutSettings(
    latestConversation.restaurantId,
  );

  if (!checkoutSettings || !isCheckoutAvailable(checkoutSettings)) {
    return sendMessage(
      latestConversation.restaurantId,
      text(
        phoneNumber,
        "Online ordering is temporarily unavailable. Please try again later.",
      ),
    );
  }

  const paymentMethod = latestConversation.context?.paymentMethod;

  if (!validateSelectedPaymentMethod(paymentMethod, checkoutSettings)) {
    return returnToPaymentSelection(
      latestConversation,
      phoneNumber,
      "Please select an available payment method before confirming your order.",
    );
  }

  const customer = await customerService.getCustomer(
    latestConversation.customerId,
    latestConversation.restaurantId,
  );

  const cart = await cartRepository.getCart(
    customer.id,
    latestConversation.restaurantId,
  );

  if (!cart || cart.items.length === 0) {
    return sendMessage(
      latestConversation.restaurantId,
      text(phoneNumber, "🛒 Your cart is empty."),
    );
  }

  const totals = orderService.calculateCheckoutTotals(
    cart.items,
    checkoutSettings,
  );

  if (totals.isBelowMinimum) {
    await conversationService.setPaymentMethod(
      latestConversation.id,
      null,
    );
    await goToState(latestConversation, ConversationState.ADDING_TO_CART);

    return sendMessage(
      latestConversation.restaurantId,
      text(
        phoneNumber,
        `The minimum order amount is ${formatCurrency(
          totals.minimumOrderAmount,
          checkoutSettings.settings.currencySymbol,
        )}. Please add more items and try again.`,
      ),
    );
  }

  const currencySymbol = checkoutSettings.settings.currencySymbol;
  let summary = "🧾 *ORDER SUMMARY*\n\n";

  for (const item of cart.items) {
    summary += `🍔 ${item.menuItem.name}\n`;
    summary += `Qty : ${item.quantity}\n`;

    if (item.options.length) {
      summary += "Options:\n";

      for (const option of item.options) {
        summary += `• ${option.name}\n`;
      }
    }

    summary += `Price : ${formatCurrency(item.totalPrice, currencySymbol)}\n`;
    summary += "\n";
  }

  summary += "──────────────────\n";
  summary += `Subtotal : ${formatCurrency(totals.subtotal, currencySymbol)}\n`;
  summary += `Tax : ${formatCurrency(totals.tax, currencySymbol)}\n`;
  summary += `Delivery : ${formatCurrency(totals.deliveryFee, currencySymbol)}\n`;
  summary += `💰 Total : ${formatCurrency(totals.total, currencySymbol)}\n\n`;

  summary += "📍 Address\n";
  summary += `${customer.address || "-"}\n\n`;

  summary += "💳 Payment\n";
  summary += `${getPaymentMethodLabel(paymentMethod)}\n\n`;

  summary += "Press *Confirm Order* to place your order.";

  return sendMessage(
    latestConversation.restaurantId,
    buttons(phoneNumber, summary, [
      {
        type: "reply",
        reply: {
          id: ButtonAction.CONFIRM_ORDER,
          title: "Confirm Order",
        },
      },
      {
        type: "reply",
        reply: {
          id: ButtonAction.CANCEL_ORDER,
          title: "Cancel",
        },
      },
    ]),
  );
};

export const handle = async (conversation, message) => {
  const action = message.buttonReply?.id;

  switch (action) {
    case ButtonAction.CONFIRM_ORDER: {
      try {
        const latestConversation =
          await conversationService.getConversationById(conversation.id);

        const customer = await customerService.getCustomer(
          latestConversation.customerId,
          latestConversation.restaurantId,
        );

        const paymentMethod = latestConversation.context?.paymentMethod;

        const order = await orderService.checkout(
          latestConversation.restaurantId,
          customer.id,
          customer.address,
          paymentMethod,
          message.messageId,
        );

        await conversationService.setPaymentMethod(
          latestConversation.id,
          null,
        );

        await goToState(latestConversation, ConversationState.TRACKING_ORDER);

        return sendMessage(
          latestConversation.restaurantId,
          text(
            message.from,
            `🎉 *Order Placed Successfully!*\n\n📦 Order Number:\n${order.orderNumber}\n\n✅ Your order has been received.\n\nThe restaurant will review your order shortly.\n\nThank you for choosing us ❤️`,
          ),
        );
      } catch (error) {
        console.error("WhatsApp checkout failed.", {
          restaurantId: conversation.restaurantId,
          customerId: conversation.customerId,
          error: error?.message,
        });

        if (
          error?.statusCode === 400 &&
          error.message?.toLowerCase().includes("minimum order")
        ) {
          await conversationService.setPaymentMethod(conversation.id, null);
          await goToState(conversation, ConversationState.ADDING_TO_CART);

          return sendMessage(
            conversation.restaurantId,
            text(
              message.from,
              `${error.message} Please add more items and try again.`,
            ),
          );
        }

        if ([400, 409].includes(error?.statusCode)) {
          return returnToPaymentSelection(
            conversation,
            message.from,
            "Checkout settings changed. Please choose an available payment method and try again.",
          );
        }

        throw error;
      }
    }

    case ButtonAction.CANCEL_ORDER:
      await goToState(conversation, ConversationState.ADDING_TO_CART);

      return sendMessage(
        conversation.restaurantId,
        text(
          message.from,
          "❌ Order cancelled.\n\nYou have been returned to your cart.",
        ),
      );

    default:
      return show(conversation, message.from);
  }
};
