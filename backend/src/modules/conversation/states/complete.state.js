import { buttons } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  await goToState(conversation, ConversationState.MAIN_MENU);

  return sendMessage(
    buttons(message.from, "Would you like anything else?", [
      {
        type: "reply",
        reply: {
          id: "ORDER",
          title: "🍔 New Order",
        },
      },
      {
        type: "reply",
        reply: {
          id: "ORDERS",
          title: "📦 My Orders",
        },
      },
    ]),
  );
};
