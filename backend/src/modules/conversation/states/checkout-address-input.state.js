import * as customerService from "../../customer/customer.service.js";

import { text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  if (message.type !== "text") {
    return sendMessage(
      conversation.restaurantId,
      text(message.from, "📍 Please type your address."),
    );
  }

  const address =
    typeof message.text === "string" ? message.text : message.text.body;

  await customerService.updateAddress(
    conversation.customerId,
    conversation.restaurantId,
    address,
  );

  await goToState(conversation, ConversationState.CHECKOUT_PAYMENT);

  return sendMessage(
    conversation.restaurantId,
    text(
      message.from,
      "✅ Address saved.\n\n💳 Payment selection will be implemented next.",
    ),
  );
};
