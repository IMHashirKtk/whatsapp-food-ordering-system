import { parseWebhook } from "./webhook.parser.js";

import { dispatch } from "../conversation/engine/dispatcher.js";

import * as customerService from "../customer/customer.service.js";
import * as conversationService from "../conversation/conversation.service.js";

export const processWebhook = async (payload) => {
  const message = parseWebhook(payload);

  if (!message) {
    console.log("Status webhook (ignored)");
    return;
  }

  console.log("\n==============================");
  console.log("NEW USER MESSAGE");
  console.log("==============================");
  console.log(JSON.stringify(message, null, 2));

  const customer = await customerService.getOrCreateCustomer(
    message.from,
    message.profileName,
  );

  const conversation = await conversationService.getOrCreateConversation(
    customer.id,
  );

  await dispatch(conversation, message);
};
