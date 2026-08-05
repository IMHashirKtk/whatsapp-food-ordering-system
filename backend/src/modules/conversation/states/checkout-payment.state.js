import * as conversationService from "../conversation.service.js";
import * as settingsRepository from "../../settings/settings.repository.js";

import { list, buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import {
  buildPaymentMessage,
  getUsablePaymentMethods,
  PAYMENT_METHODS,
  validateSelectedPaymentMethod,
} from "../payment.helper.js";
import { ButtonAction } from "../engine/command.constants.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

const actionToMethod = {
  [ButtonAction.PAYMENT_EASYPAISA]: PAYMENT_METHODS.EASYPAISA,
  [ButtonAction.PAYMENT_JAZZCASH]: PAYMENT_METHODS.JAZZCASH,
  [ButtonAction.PAYMENT_BANK_TRANSFER]: PAYMENT_METHODS.BANK_TRANSFER,
  [ButtonAction.PAYMENT_COD]: PAYMENT_METHODS.COD,
};

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

const sendUnavailableMessage = (conversation, phoneNumber, message) =>
  sendMessage(
    conversation.restaurantId,
    text(phoneNumber, message),
  );

const isCheckoutAvailable = (checkoutSettings) =>
  checkoutSettings.isOpen === true &&
  checkoutSettings.settings.orderAcceptanceEnabled === true;

export const show = async (conversation, phoneNumber, notice = null) => {
  const checkoutSettings = await loadCheckoutSettings(conversation.restaurantId);

  if (!checkoutSettings) {
    return sendUnavailableMessage(
      conversation,
      phoneNumber,
      "Online ordering is temporarily unavailable. Please try again later.",
    );
  }

  if (!isCheckoutAvailable(checkoutSettings)) {
    return sendUnavailableMessage(
      conversation,
      phoneNumber,
      "Online ordering is temporarily unavailable. Please try again later.",
    );
  }

  const usableMethods = getUsablePaymentMethods(checkoutSettings);

  if (usableMethods.length === 0) {
    return sendUnavailableMessage(
      conversation,
      phoneNumber,
      "Payment methods are temporarily unavailable. Please try again later.",
    );
  }

  const body = [
    notice,
    "💳 *Select Payment Method*",
    "Choose a payment method:",
  ]
    .filter(Boolean)
    .join("\n\n");

  return sendMessage(
    conversation.restaurantId,
    list(phoneNumber, body, "Choose", [
      {
        title: "Payment Methods",
        rows: usableMethods.map((method) => ({
          id: method.action,
          title: method.label,
          description: method.description,
        })),
      },
    ]),
  );
};

const showUnavailableSelection = (conversation, message) =>
  show(
    conversation,
    message.from,
    "That payment method is no longer available. Please choose another method.",
  );

const moveToConfirmation = async (conversation, message) => {
  const checkoutSettings = await loadCheckoutSettings(conversation.restaurantId);
  const selectedMethod = conversation.context?.paymentMethod;

  if (
    !checkoutSettings ||
    !isCheckoutAvailable(checkoutSettings) ||
    !validateSelectedPaymentMethod(selectedMethod, checkoutSettings)
  ) {
    console.error("Stale or invalid payment method during checkout.", {
      restaurantId: conversation.restaurantId,
      paymentMethod: selectedMethod,
    });
    await conversationService.setPaymentMethod(conversation.id, null);
    await goToState(conversation, ConversationState.CHECKOUT_PAYMENT);
    return showUnavailableSelection(conversation, message);
  }

  await goToState(conversation, ConversationState.CHECKOUT_CONFIRM);

  const updatedConversation = await conversationService.getConversationById(
    conversation.id,
  );

  const checkoutConfirmState = await import("./checkout-confirm.state.js");

  return checkoutConfirmState.show(updatedConversation, message.from);
};

export const handle = async (conversation, message) => {
  const action = message.listReply?.id || message.buttonReply?.id;
  const selectedMethod = actionToMethod[action];

  if (selectedMethod) {
    const checkoutSettings = await loadCheckoutSettings(
      conversation.restaurantId,
    );

    if (
      !checkoutSettings ||
      !isCheckoutAvailable(checkoutSettings) ||
      !validateSelectedPaymentMethod(selectedMethod, checkoutSettings)
    ) {
      console.error("Unavailable payment method was selected.", {
        restaurantId: conversation.restaurantId,
        paymentMethod: selectedMethod,
      });
      return showUnavailableSelection(conversation, message);
    }

    await conversationService.setPaymentMethod(
      conversation.id,
      selectedMethod,
    );

    const paymentMessage = buildPaymentMessage(
      selectedMethod,
      checkoutSettings,
    );

    if (!paymentMessage) {
      console.error("Payment message could not be built.", {
        restaurantId: conversation.restaurantId,
        paymentMethod: selectedMethod,
      });
      await conversationService.setPaymentMethod(conversation.id, null);
      return showUnavailableSelection(conversation, message);
    }

    const confirmationAction =
      selectedMethod === PAYMENT_METHODS.COD
        ? ButtonAction.CONFIRM_COD
        : ButtonAction.PAYMENT_DONE;

    return sendMessage(
      conversation.restaurantId,
      buttons(message.from, paymentMessage, [
        {
          type: "reply",
          reply: {
            id: confirmationAction,
            title:
              selectedMethod === PAYMENT_METHODS.COD
                ? "Confirm COD"
                : "I've Paid",
          },
        },
      ]),
    );
  }

  if (action === ButtonAction.PAYMENT_DONE) {
    if (conversation.context?.paymentMethod === PAYMENT_METHODS.COD) {
      return showUnavailableSelection(conversation, message);
    }

    return moveToConfirmation(conversation, message);
  }

  if (action === ButtonAction.CONFIRM_COD) {
    if (conversation.context?.paymentMethod !== PAYMENT_METHODS.COD) {
      return showUnavailableSelection(conversation, message);
    }

    return moveToConfirmation(conversation, message);
  }

  return show(conversation, message.from);
};
