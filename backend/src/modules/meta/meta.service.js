import { parseWebhook } from "./webhook.parser.js";
import { sendMessage } from "./meta.api.js";
import { buildTextMessage } from "./message.builder.js";

export const processWebhook = async (payload) => {
  const message = parseWebhook(payload);

  if (!message) return;

  console.log(message);

  await sendMessage(
    buildTextMessage(message.from, `You said:\n\n${message.text}`),
  );
};
