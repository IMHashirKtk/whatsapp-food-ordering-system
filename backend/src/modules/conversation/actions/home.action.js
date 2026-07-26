import { buttons } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";
import { GlobalCommand } from "../engine/command.constants.js";

export const handle = async (conversation, message) => {
  return sendMessage(
    conversation.restaurantId,
    buttons(message.from, "Please choose an option below.", [
      {
        type: "reply",
        reply: {
          id: GlobalCommand.MENU,
          title: "🍔 Order Food",
        },
      },
      {
        type: "reply",
        reply: {
          id: GlobalCommand.TRACK,
          title: "📦 My Orders",
        },
      },
      {
        type: "reply",
        reply: {
          id: "GlobalCommand.HELP",
          title: "💬 Support",
        },
      },
    ]),
  );
};
