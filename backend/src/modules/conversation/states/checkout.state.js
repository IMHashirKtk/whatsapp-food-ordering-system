import * as orderService from "../../order/order.service.js";

import { text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  if (message.buttonReply?.id !== "CHECKOUT") {
    return sendMessage(
      text(message.from, "Please use the Checkout button to continue."),
    );
  }

  const order = await orderService.checkout(conversation.customerId);

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
