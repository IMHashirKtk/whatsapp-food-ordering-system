import { buildButtonMessage } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { goToState } from "./state.helper.js";
import { ConversationState } from "./state.constants.js";

export const handle = async (conversation, message) => {
  await sendMessage(
    buildButtonMessage(
      message.from,
      "👋 Welcome to Foodaji!\n\nHow can we help you today?",
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
            title: "📦 Orders",
          },
        },
        {
          type: "reply",
          reply: {
            id: "HELP",
            title: "☎️ Help",
          },
        },
      ],
    ),
  );

  await goToState(conversation, ConversationState.MAIN_MENU);
};
