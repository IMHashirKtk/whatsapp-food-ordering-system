import { ConversationState } from "../states/state.constants.js";

import * as welcomeState from "../states/welcome.state.js";
import * as mainMenuState from "../states/main-menu.state.js";
import * as categoryState from "../states/category.state.js";
import * as productState from "../states/product.state.js";
import * as cartState from "../states/cart.state.js";
import * as checkoutState from "../states/checkout.state.js";

const handlers = {
  [ConversationState.WELCOME]: welcomeState,
  [ConversationState.MAIN_MENU]: mainMenuState,
  [ConversationState.CATEGORY]: categoryState,
  [ConversationState.PRODUCT]: productState,
  [ConversationState.CART]: cartState,
  [ConversationState.CHECKOUT]: checkoutState,
};

export const dispatch = async (conversation, message) => {
  const handler =
    handlers[conversation.state] ?? handlers[ConversationState.WELCOME];

  return handler.handle(conversation, message);
};
