import { parseWebhook } from "./webhook.parser.js";
import { sendMessage } from "./meta.api.js";
import { buildTextMessage } from "./message.builder.js";

export const processWebhook = async (payload) => {
  const message = parseWebhook(payload);

  if (!message) return;

  // Temporary conversation object
  const conversation = await conversationService.getOrCreateConversation(
    message.from,
  );

  await dispatch(conversation, message);
};
