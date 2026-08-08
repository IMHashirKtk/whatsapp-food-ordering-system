import * as cartService from "../../cart/cart.service.js";
import {
  MAX_CART_QUANTITY,
  parseCartQuantity,
} from "../../cart/cart.rules.js";
import { formatCart, getCartButtons } from "../../cart/cart.helper.js";
import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";
import { GlobalCommand, ButtonAction } from "../engine/command.constants.js";
import * as homeAction from "../actions/home.action.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";
import * as categoryState from "./category.state.js";
import * as checkoutAddressState from "./checkout-address.state.js";

export const handle = async (conversation, message) => {
  // Waiting for quantity
  if (message.type === "text") {
    const quantityInput =
      typeof message.text === "string" ? message.text : message.text?.body;
    const quantity = parseCartQuantity(quantityInput);

    if (quantity === null) {
      return sendMessage(
        conversation.restaurantId,
        text(
          message.from,
          `Please enter a whole number between 1 and ${MAX_CART_QUANTITY}.`,
        ),
      );
    }

    const context = conversation.context;

    try {
      await cartService.addItem({
        restaurantId: conversation.restaurantId,
        customerId: conversation.customerId,
        menuItemId: context.menuItemId,
        quantity,
        selectedOptions: context.selectedOptions,
        sourceMessageId: message.messageId,
      });
    } catch (error) {
      if ([400, 404, 409].includes(error?.statusCode)) {
        await goToState(conversation, ConversationState.VIEWING_MENU);
        await sendMessage(
          conversation.restaurantId,
          text(
            message.from,
            "That menu selection is no longer available. Please choose from the current menu.",
          ),
        );

        return categoryState.handle(conversation, {
          ...message,
          buttonReply: null,
          listReply: null,
        });
      }

      throw error;
    }

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

    case GlobalCommand.CHECKOUT: {
      await goToState(conversation, ConversationState.CHECKOUT_ADDRESS);

      return checkoutAddressState.show(conversation, message.from);
    }

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
