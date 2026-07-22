import { parseWebhook } from "./webhook.parser.js";

import { dispatch } from "../conversation/engine/dispatcher.js";

import * as customerService from "../customer/customer.service.js";
import * as conversationService from "../conversation/conversation.service.js";

export const processWebhook = async (payload) => {
  console.log("========== NEW WEBHOOK ==========");
  console.log("Message type:", message?.type);
  console.log("Message:", JSON.stringify(message, null, 2));
  const message = parseWebhook(payload);

  if (!message) return;

  const customer = await customerService.getOrCreateCustomer(
    message.from,
    message.profileName,
  );

  const conversation = await conversationService.getOrCreateConversation(
    customer.id,
  );

  await dispatch(conversation, message);
};
