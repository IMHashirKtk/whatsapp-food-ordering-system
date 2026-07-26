import * as cartAction from "../actions/cart.action.js";
import * as homeAction from "../actions/home.action.js";
import * as ordersAction from "../actions/orders.action.js";
import * as helpAction from "../actions/help.action.js";
import * as conversationService from "../conversation.service.js";

import { GlobalCommand } from "./command.constants.js";

export const handleCommand = async (conversation, message) => {
  if (!message.command) {
    return false;
  }

  switch (message.command) {
    case GlobalCommand.CART:
      await cartAction.handle(conversation, message);
      return true;

    case GlobalCommand.HOME:
      await conversationService.pushNavigation(conversation.id);
      await homeAction.handle(conversation, message);
      return true;

    case GlobalCommand.TRACK:
      await conversationService.pushNavigation(conversation.id);
      await ordersAction.handle(conversation, message);
      return true;

    case GlobalCommand.HELP:
      await conversationService.pushNavigation(conversation.id);
      await helpAction.handle(conversation, message);
      return true;

    default:
      return false;
  }
};
