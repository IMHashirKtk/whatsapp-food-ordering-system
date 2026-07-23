import { ConversationState } from "../states/state.constants.js";

import * as welcomeState from "../states/welcome.state.js";
import * as mainMenuState from "../states/main-menu.state.js";
import * as categoryState from "../states/category.state.js";
import * as productState from "../states/product.state.js";
import * as cartState from "../states/cart.state.js";
import * as checkoutState from "../states/checkout.state.js";
import * as completeState from "../states/complete.state.js";
import * as productOptionsState from "../states/product-options.state.js";
import { handleText } from "./text.handler.js";
import { handleButton } from "./button.handler.js";
import { handleList } from "./list.handler.js";

const stateHandlers = {
  [ConversationState.IDLE]: welcomeState,

  [ConversationState.MAIN_MENU]: mainMenuState,

  [ConversationState.VIEWING_MENU]: categoryState,

  [ConversationState.ORDERING]: productState,

  [ConversationState.SELECTING_OPTIONS]: productOptionsState,

  [ConversationState.VIEWING_CART]: cartState,

  [ConversationState.CHECKOUT]: checkoutState,

  [ConversationState.TRACKING_ORDER]: completeState,
};

export const dispatch = async (conversation, message) => {
  const stateHandler = stateHandlers[conversation.state];

  if (!stateHandler) {
    throw new Error(`Unknown conversation state: ${conversation.state}`);
  }

  switch (message.type) {
    case "text":
      return handleText(stateHandler, conversation, message);

    case "button":
    case "interactive_button":
      return handleButton(stateHandler, conversation, message);

    case "list":
    case "interactive_list":
      return handleList(stateHandler, conversation, message);

    default:
      return handleText(stateHandler, conversation, message);
  }
};
