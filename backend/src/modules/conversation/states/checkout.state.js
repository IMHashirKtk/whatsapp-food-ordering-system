import * as orderService from "../../order/order.service.js";
import * as conversationService from "../conversation.service.js";

import { text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  // We only expect a text address here
  if (message.type !== "text") {
    return sendMessage(
      text(message.from, "📍 Please type your delivery address."),
    );
  }

  // Save address in conversation context
  await conversationService.updateContext(conversation.id, {
    deliveryAddress:
      typeof message.text === "string" ? message.text : message.text?.body,
  });

  // Create the order
  const address =
    typeof message.text === "string" ? message.text : message.text?.body;

  await conversationService.updateContext(conversation.id, {
    deliveryAddress: address,
  });

  const order = await orderService.checkout(conversation.customerId, address);

  // Move to tracking state
  await goToState(conversation, ConversationState.TRACKING_ORDER);

  return sendMessage(
    text(
      message.from,
      `✅ Order placed successfully!

Order No: ${order.orderNumber}

Thank you for ordering with us!`,
    ),
  );
};
