import * as cartService from "../../cart/cart.service.js";

import { formatCart, getCartButtons } from "../../cart/cart.helper.js";

import { buttons } from "../../meta/message.factory.js";

import { sendMessage } from "../../meta/meta.api.js";

import * as conversationService from "../conversation.service.js";

export const handle = async (conversation, message) => {
  await conversationService.pushNavigation(conversation.id);

  const cart = await cartService.getCart(
    conversation.customerId,
    conversation.restaurantId,
  );

  return sendMessage(
    conversation.restaurantId,
    buttons(message.from, formatCart(cart), getCartButtons(cart)),
  );
};
