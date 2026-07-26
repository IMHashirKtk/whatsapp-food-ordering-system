import * as customerService from "../../customer/customer.service.js";

import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ButtonAction } from "../engine/command.constants.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  const customer = await customerService.getCustomer(
    conversation.customerId,
    conversation.restaurantId,
  );

  // First entry into this state
  if (!message.buttonReply && message.type !== "text") {
    if (!customer.address) {
      await goToState(conversation, ConversationState.CHECKOUT_ADDRESS_INPUT);

      return sendMessage(
        conversation.restaurantId,
        text(message.from, "📍 Please enter your delivery address."),
      );
    }

    return sendMessage(
      conversation.restaurantId,
      buttons(
        message.from,
        `📍 Delivery Address\n\n${customer.address}\n\nWould you like to use this address?`,
        [
          {
            type: "reply",
            reply: {
              id: ButtonAction.USE_SAVED_ADDRESS,
              title: "✅ Use Saved",
            },
          },
          {
            type: "reply",
            reply: {
              id: ButtonAction.NEW_ADDRESS,
              title: "✏️ New Address",
            },
          },
        ],
      ),
    );
  }

  switch (message.buttonReply?.id) {
    case ButtonAction.USE_SAVED_ADDRESS:
      await goToState(conversation, ConversationState.CHECKOUT_PAYMENT);

      return sendMessage(
        conversation.restaurantId,
        text(message.from, "💳 Payment selection will be implemented next."),
      );

    case ButtonAction.NEW_ADDRESS:
      await goToState(conversation, ConversationState.CHECKOUT_ADDRESS_INPUT);

      return sendMessage(
        conversation.restaurantId,
        text(message.from, "📍 Please enter your new delivery address."),
      );

    default:
      return sendMessage(
        conversation.restaurantId,
        text(message.from, "Please use the buttons."),
      );
  }
};
