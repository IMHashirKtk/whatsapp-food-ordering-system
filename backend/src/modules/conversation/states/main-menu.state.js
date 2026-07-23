import { buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";
import * as categoryState from "./category.state.js";
import * as orderService from "../../order/order.service.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  switch (message.buttonReply?.id) {
    case "ORDER":
      await goToState(conversation, ConversationState.VIEWING_MENU);

      return categoryState.handle(conversation, message);

    case "ORDERS": {
      const orders = await orderService.getCustomerOrders(
        conversation.customerId,
      );

      if (!orders.length) {
        return sendMessage(
          text(
            message.from,
            "📦 You haven't placed any orders yet.\n\nTap *🍔 Order Food* to place your first order!",
          ),
        );
      }

      const statusMap = {
        PENDING: "⏳ Preparing",
        CONFIRMED: "👨‍🍳 Confirmed",
        PREPARING: "🍳 Preparing",
        READY: "📦 Ready for Pickup",
        OUT_FOR_DELIVERY: "🛵 On the Way",
        DELIVERED: "✅ Delivered",
        CANCELLED: "❌ Cancelled",
      };

      const messageText =
        "📦 *Your Orders*\n\n" +
        orders
          .map((order) => {
            const items = order.items
              .map((item) => {
                const options =
                  item.options.length > 0
                    ? "\n" +
                      item.options
                        .map((option) => `   ➕ ${option.name}`)
                        .join("\n")
                    : "";

                return `• ${item.menuItem.name} ×${item.quantity}${options}`;
              })
              .join("\n");

            return (
              `━━━━━━━━━━━━━━━━━━\n` +
              `🧾 *Order #${order.orderNumber}*\n\n` +
              `🍽️ *Items*\n${items}\n\n` +
              `💰 *Total:* Rs. ${Number(order.total).toFixed(2)}\n` +
              `📌 *Status:* ${statusMap[order.status] || order.status}`
            );
          })
          .join("\n\n");

      return sendMessage(text(message.from, messageText));
    }

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
