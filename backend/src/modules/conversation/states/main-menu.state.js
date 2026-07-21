import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";
import * as categoryState from "./category.state.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  switch (message.buttonReply?.id) {
    case "ORDER":
      await goToState(conversation, ConversationState.CATEGORY);

      return categoryState.handle(conversation, message);

    case "ORDERS":
      return sendMessage(
        text(message.from, "📦 You don't have any orders yet."),
      );

    case "HELP":
      return sendMessage(
        text(
          message.from,
          "💬 A support representative will assist you shortly.",
        ),
      );

    default:
      return sendMessage(
        buttons(message.from, "Please choose an option below.", [
          {
            type: "reply",
            reply: {
              id: "ORDER",
              title: "🍔 Order Food",
            },
          },
          {
            type: "reply",
            reply: {
              id: "ORDERS",
              title: "📦 My Orders",
            },
          },
          {
            type: "reply",
            reply: {
              id: "HELP",
              title: "💬 Support",
            },
          },
        ]),
      );
  }
};
