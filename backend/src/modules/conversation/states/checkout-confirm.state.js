import { text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

export const handle = async (conversation, message) => {
  return sendMessage(
    conversation.restaurantId,
    text(message.from, "✅ Confirmation state is under development."),
  );
};
