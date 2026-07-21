import { buttons } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { goToState } from "./state.helper.js";
import { ConversationState } from "./state.constants.js";

export const handle = async (conversation, message) => {
  await sendMessage(
    buttons(
      message.from,
      "👋 Welcome to *Foodaji*!\n\nWhat would you like to do today?",
      [
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
      ],
    ),
  );

  await goToState(conversation, ConversationState.MAIN_MENU);
};
