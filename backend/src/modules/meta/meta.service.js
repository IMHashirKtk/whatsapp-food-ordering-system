import { parseWebhook } from "./webhook.parser.js";

import { dispatch } from "../conversation/engine/dispatcher.js";

import * as restaurantService from "../restaurant/restaurant.service.js";
import * as customerService from "../customer/customer.service.js";
import * as conversationService from "../conversation/conversation.service.js";

export const processWebhook = async (payload) => {
  const message = parseWebhook(payload);

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

  const conversation = await conversationService.getOrCreateConversation(
    customer.id,
    restaurant.id,
  );

  await dispatch(conversation, message);
};
