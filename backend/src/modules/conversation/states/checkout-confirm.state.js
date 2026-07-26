import * as cartRepository from "../../cart/cart.repository.js";
import * as customerService from "../../customer/customer.service.js";
import * as conversationService from "../conversation.service.js";
import * as orderService from "../../order/order.service.js";

import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ButtonAction } from "../engine/command.constants.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

const formatPaymentMethod = (method) => {
  switch (method) {
    case "EASYPAISA":
      return "Easypaisa";

    case "JAZZCASH":
      return "JazzCash";

    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "COD":
      return "Cash on Delivery";

    default:
      return method || "-";
  }
};

export const show = async (conversation, phoneNumber) => {
  const latestConversation = await conversationService.getConversationById(
    conversation.id,
  );

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

  const paymentMethod = latestConversation.context?.paymentMethod || "COD";

  let subtotal = 0;

  let summary = "🧾 *ORDER SUMMARY*\n\n";

  for (const item of cart.items) {
    subtotal += Number(item.totalPrice);

    summary += `🍔 ${item.menuItem.name}\n`;
    summary += `Qty : ${item.quantity}\n`;

    if (item.options.length) {
      summary += "Options:\n";

      for (const option of item.options) {
        summary += `• ${option.name}\n`;
      }
    }

    summary += `Price : Rs. ${Number(item.totalPrice).toFixed(2)}\n`;
    summary += "\n";
  }

  summary += "──────────────────\n";
  summary += `💰 Total : Rs. ${subtotal.toFixed(2)}\n\n`;

  summary += `📍 Address\n`;
  summary += `${customer.address}\n\n`;

  summary += `💳 Payment\n`;
  summary += `${formatPaymentMethod(paymentMethod)}\n\n`;

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

        const paymentMethod =
          latestConversation.context?.paymentMethod || "COD";

        const order = await orderService.checkout(
          latestConversation.restaurantId,
          customer.id,
          customer.address,
          paymentMethod,
        );

        // Clear payment method from conversation context
        await conversationService.updateContext(latestConversation.id, {
          paymentMethod: null,
        });

        await goToState(latestConversation, ConversationState.TRACKING_ORDER);

        return sendMessage(
          latestConversation.restaurantId,
          text(
            message.from,
            `🎉 *Order Placed Successfully!*

📦 Order Number:
${order.orderNumber}

✅ Your order has been received.

The restaurant will review your order shortly.

Thank you for choosing Foodaji ❤️`,
          ),
        );
      } catch (error) {
        console.error(error);

        return sendMessage(
          conversation.restaurantId,
          text(
            message.from,
            "❌ Unable to place your order.\n\nPlease try again.",
          ),
        );
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
