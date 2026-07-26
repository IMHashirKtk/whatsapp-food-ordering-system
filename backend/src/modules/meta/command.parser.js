import { GlobalCommand } from "../conversation/engine/command.constants.js";

const COMMANDS = {
  home: GlobalCommand.HOME,
  menu: GlobalCommand.MENU,
  cart: GlobalCommand.CART,
  checkout: GlobalCommand.CHECKOUT,
  track: GlobalCommand.TRACK,
  order: GlobalCommand.TRACK,
  orders: GlobalCommand.TRACK,
  help: GlobalCommand.HELP,
  cancel: GlobalCommand.CANCEL,
};

export const parseCommand = (message) => {
  if (!message) return null;

  // Text command
  if (message.text) {
    const text = message.text.trim().toLowerCase();

    if (COMMANDS[text]) {
      return COMMANDS[text];
    }
  }

  // Button command
  if (message.buttonReply?.id) {
    const id = message.buttonReply.id.trim().toLowerCase();

    if (COMMANDS[id]) {
      return COMMANDS[id];
    }
  }

  // List command
  if (message.listReply?.id) {
    const id = message.listReply.id.trim().toLowerCase();

    if (COMMANDS[id]) {
      return COMMANDS[id];
    }
  }

  return null;
};
