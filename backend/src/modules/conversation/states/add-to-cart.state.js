import * as cartService from "../../cart/cart.service.js";
import { formatCart, getCartButtons } from "../../cart/cart.helper.js";
import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";
import { GlobalCommand, ButtonAction } from "../engine/command.constants.js";
import * as homeAction from "../actions/home.action.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";
import * as categoryState from "./category.state.js";

export const handle = async (conversation, message) => {
  console.log(">>> CART STATE");
  console.log("message.type:", message.type);
  console.log("message.text:", message.text);
  console.log("message:", JSON.stringify(message, null, 2));

  // Waiting for quantity
  if (message.type === "text") {
    const quantity = Number(
      typeof message.text === "string" ? message.text : message.text?.body,
    );

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return sendMessage(
        conversation.restaurantId,
        text(message.from, "Please enter a valid quantity.\n\nExample: 2"),
      );
    }

    const context = conversation.context;

    await cartService.addItem({
      restaurantId: conversation.restaurantId,
      customerId: conversation.customerId,
      menuItemId: context.menuItemId,
      quantity,
      selectedOptions: context.selectedOptions,
    });

    const cart = await cartService.getCart(
      conversation.customerId,
      conversation.restaurantId,
    );

    return sendMessage(
      conversation.restaurantId,
      buttons(message.from, formatCart(cart), getCartButtons(cart)),
    );
  }

  switch (message.buttonReply?.id) {
    case ButtonAction.CONTINUE_SHOPPING:
      await goToState(conversation, ConversationState.VIEWING_MENU);

      return categoryState.handle(conversation, {
        ...message,
        buttonReply: null,
        listReply: null,
      });

    case GlobalCommand.CHECKOUT:
      await goToState(conversation, ConversationState.CHECKOUT);

      return sendMessage(
        conversation.restaurantId,
        text(message.from, "📍 Please enter your delivery address."),
      );

    case ButtonAction.CLEAR_CART:
      await cartService.clearCart(
        conversation.customerId,
        conversation.restaurantId,
      );

      await goToState(conversation, ConversationState.MAIN_MENU);

      return homeAction.handle(conversation, message);

    default:
      return sendMessage(
        conversation.restaurantId,
        text(message.from, "Please use the buttons below."),
      );
  }
};
