import { parseWebhook } from "./webhook.parser.js";

import * as restaurantService from "../restaurant/restaurant.service.js";
import * as customerService from "../customer/customer.service.js";
import * as conversationService from "../conversation/conversation.service.js";
import { text } from "./message.factory.js";
import { sendMessage } from "./meta.api.js";
import { getOrderStatusNotificationMessage } from "./meta.templates.js";

export const processWebhook = async (payload) => {
  const message = parseWebhook(payload);
  console.log("===== BOT VERSION 2026-07-26 =====");
  console.log("Parsed message:", message);

  if (!message) {
    console.log("Status webhook (ignored)");
    return;
  }

  const restaurant = await restaurantService.getRestaurantByMetaPhoneNumberId(
    message.phoneNumberId,
  );

  console.log("\n==============================");
  console.log("Restaurant:", restaurant.name);
  console.log("Customer:", message.from);
  console.log("==============================");

  const customer = await customerService.getOrCreateCustomer(
    restaurant.id,
    message.from,
    message.profileName,
  );
  console.log("3. Customer found:", customer.id);

  const conversation = await conversationService.getOrCreateConversation(
    customer.id,
    restaurant.id,
  );

  console.log("4. Conversation found:", conversation.id);
  console.log("Conversation state:", conversation.state);
  console.log("Conversation context:", conversation.context);

  const { dispatch } = await import("../conversation/engine/dispatcher.js");

  await dispatch(conversation, message);
};

export const sendOrderStatusNotification = async ({
  restaurantId,
  to,
  status,
  orderNumber,
  restaurantName,
}) => {
  const message = getOrderStatusNotificationMessage({
    status,
    orderNumber,
    restaurantName,
  });

  if (!message) {
    return null;
  }

  if (!to) {
    throw new Error("Customer WhatsApp number is missing.");
  }

  return sendMessage(restaurantId, text(to, message));
};
