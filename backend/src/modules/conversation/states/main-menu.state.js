import { text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";
import { GlobalCommand } from "../engine/command.constants.js";
import * as categoryState from "./category.state.js";
import * as helpAction from "../actions/help.action.js";
import * as ordersAction from "../actions/orders.action.js";
import * as homeAction from "../actions/home.action.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  switch (message.buttonReply?.id) {
    case GlobalCommand.MENU:
      await goToState(conversation, ConversationState.VIEWING_MENU);

      return categoryState.handle(conversation, message);

    case GlobalCommand.TRACK:
      return ordersAction.handle(conversation, message);

    case GlobalCommand.HELP:
      return helpAction.handle(conversation, message);

    default:
      return homeAction.handle(conversation, message);
  }
};
