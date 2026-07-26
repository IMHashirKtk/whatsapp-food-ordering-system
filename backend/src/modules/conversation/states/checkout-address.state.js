import * as customerService from "../../customer/customer.service.js";

import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";
import * as checkoutPaymentState from "./checkout-payment.state.js";
import { ButtonAction } from "../engine/command.constants.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

/**
 * Called when entering the CHECKOUT_ADDRESS state.
 * Displays the saved address (if available) or asks for a new one.
 */
export const show = async (conversation, phoneNumber) => {
  const customer = await customerService.getCustomer(
    conversation.customerId,
    conversation.restaurantId,
  );

  // Customer has no saved address
  if (!customer.address) {
    await goToState(conversation, ConversationState.CHECKOUT_ADDRESS_INPUT);

    return sendMessage(
      conversation.restaurantId,
      text(phoneNumber, "📍 Please enter your delivery address."),
    );
  }

  // Customer has a saved address
  return sendMessage(
    conversation.restaurantId,
    buttons(
      phoneNumber,
      `📍 *Delivery Address*\n\n${customer.address}\n\nWould you like to use this address?`,
      [
        {
          type: "reply",
          reply: {
            id: ButtonAction.USE_SAVED_ADDRESS,
            title: "Use Saved",
          },
        },
        {
          type: "reply",
          reply: {
            id: ButtonAction.NEW_ADDRESS,
            title: "New Address",
          },
        },
      ],
    ),
  );
};

/**
 * Called when the customer clicks one of the address buttons.
 */
export const handle = async (conversation, message) => {
  const action = message.buttonReply?.id;

  switch (action) {
    case ButtonAction.USE_SAVED_ADDRESS:
      await goToState(conversation, ConversationState.CHECKOUT_PAYMENT);

      return checkoutPaymentState.show(conversation, message.from);

    case ButtonAction.NEW_ADDRESS:
      await goToState(conversation, ConversationState.CHECKOUT_ADDRESS_INPUT);

      return sendMessage(
        conversation.restaurantId,
        text(message.from, "📍 Please type your new delivery address."),
      );

    default:
      return sendMessage(
        conversation.restaurantId,
        text(message.from, "Please select one of the available options."),
      );
  }
};
