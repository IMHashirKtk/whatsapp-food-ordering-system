import * as cartService from "../../cart/cart.service.js";

import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

import { formatCart } from "../../cart/cart.helper.js";

export const handle = async (conversation, message) => {
  // Waiting for quantity
  if (message.type === "text") {
    const quantity = Number(message.text?.body);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return sendMessage(
        text(message.from, "Please enter a valid quantity.\n\nExample: 2"),
      );
    }

    const context = conversation.context;

    await cartService.addItem({
      customerId: conversation.customerId,
      menuItemId: context.menuItemId,
      quantity,
      selectedOptions: context.selectedOptions,
    });

    const cart = await cartService.getCart(conversation.customerId);

    return sendMessage(
      buttons(message.from, formatCart(cart), [
        {
          type: "reply",
          reply: {
            id: "ADD_MORE",
            title: "➕ Add More",
          },
        },
        {
          type: "reply",
          reply: {
            id: "CHECKOUT",
            title: "✅ Checkout",
          },
        },
        {
          type: "reply",
          reply: {
            id: "CLEAR_CART",
            title: "🗑️ Clear Cart",
          },
        },
      ]),
    );
  }

  switch (message.buttonReply?.id) {
    case "ADD_MORE":
      await goToState(conversation, ConversationState.VIEWING_MENU);

      return sendMessage(text(message.from, "Let's continue shopping."));

    case "CHECKOUT":
      await goToState(conversation, ConversationState.CHECKOUT);

      return sendMessage(text(message.from, "Preparing checkout..."));

    case "CLEAR_CART":
      await cartService.clearCart(conversation.customerId);

      await goToState(conversation, ConversationState.VIEWING_MENU);

      return sendMessage(text(message.from, "🗑️ Cart cleared."));

    default:
      return sendMessage(text(message.from, "Please use the buttons below."));
  }
};
