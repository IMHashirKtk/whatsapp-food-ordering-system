import * as customerService from "./customer.service.js";
import * as metaService from "./meta.service.js";

export const processConversation = async (customer, incomingMessage) => {
  switch (customer.state) {
    case "IDLE":
      await metaService.sendTextMessage(
        customer.whatsappId,
        `👋 Welcome to Foodaji!

Reply with:

1️⃣ View Menu
2️⃣ View Cart
3️⃣ Track Order`,
      );

      await customerService.updateState(customer.id, "MAIN_MENU");

      break;

    case "MAIN_MENU":
      switch (incomingMessage.text.trim()) {
        case "1":
          await metaService.sendTextMessage(
            customer.whatsappId,
            "🍕 Menu coming next...",
          );
          break;

        case "2":
          await metaService.sendTextMessage(
            customer.whatsappId,
            "🛒 Your cart is empty.",
          );
          break;

        case "3":
          await metaService.sendTextMessage(
            customer.whatsappId,
            "📦 No active orders.",
          );
          break;

        default:
          await metaService.sendTextMessage(
            customer.whatsappId,
            "Please reply with 1, 2 or 3.",
          );
      }

      break;
  }
};
