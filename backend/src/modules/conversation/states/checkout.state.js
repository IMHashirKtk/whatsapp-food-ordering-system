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
      conversation.restaurantId,
      text(message.from, "📍 Please type your delivery address."),
    );
  }

  const address =
    typeof message.text === "string" ? message.text : message.text?.body;

  // Save address in conversation context
  await conversationService.updateContext(conversation.id, {
    deliveryAddress: address,
  });

  // Create the order
  const order = await orderService.checkout(
    restaurantId,
    customerId,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
  );

  // Move to tracking state
  await goToState(conversation, ConversationState.TRACKING_ORDER);

  return sendMessage(
    conversation.restaurantId,
    text(
      message.from,
      `✅ Order placed successfully!

Order No: ${order.orderNumber}

Thank you for ordering with us!`,
    ),
  );
};
