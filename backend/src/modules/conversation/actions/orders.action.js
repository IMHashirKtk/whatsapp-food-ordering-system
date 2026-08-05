import { text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import * as orderService from "../../order/order.service.js";
import * as settingsRepository from "../../settings/settings.repository.js";
import {
  formatCurrency,
  getPaymentMethodLabel,
} from "../payment.helper.js";

const statusMap = {
  PENDING: "🟡 Pending Confirmation",
  ACCEPTED: "✅ Accepted",
  PREPARING: "👨‍🍳 Preparing",
  READY: "📦 Ready for Pickup",
  OUT_FOR_DELIVERY: "🛵 Out for Delivery",
  DELIVERED: "🎉 Delivered",
  CANCELLED: "❌ Cancelled",
};

export const handle = async (conversation, message) => {
  const orders = await orderService.getActiveCustomerOrders(
    conversation.customerId,
    conversation.restaurantId,
  );

  let currencySymbol = "Rs";

  try {
    const checkoutSettings = await settingsRepository.getCheckoutSettings(
      conversation.restaurantId,
    );
    currencySymbol = checkoutSettings?.settings?.currencySymbol || currencySymbol;
  } catch (error) {
    console.error("Failed to load currency settings for order history.", {
      restaurantId: conversation.restaurantId,
      error: error?.message,
    });
  }

  if (!orders.length) {
    return sendMessage(
      conversation.restaurantId,
      text(
        message.from,
        "📦 You haven't placed any orders yet.\n\nTap *🍔 Order Food* to place your first order!",
      ),
    );
  }

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

        const estimatedReady = order.estimatedReadyTime
          ? `⏱ *Estimated Ready:* ${order.estimatedReadyTime} min\n`
          : "";

        const paymentMethod = order.paymentMethod
          ? `💳 *Payment:* ${getPaymentMethodLabel(order.paymentMethod)}\n`
          : "";

        const deliveryAddress = order.deliveryAddress
          ? `📍 *Delivery Address:*\n${order.deliveryAddress}\n`
          : "";

        const orderedAt = new Date(order.createdAt).toLocaleString("en-PK", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Karachi",
        });

        return (
          `━━━━━━━━━━━━━━━━━━\n` +
          `🧾 *Order #${order.orderNumber}*\n\n` +
          `📌 *Status:* ${statusMap[order.status] || order.status}\n\n` +
          `🍽️ *Items*\n${items}\n\n` +
          `💰 *Total:* ${formatCurrency(order.total, currencySymbol)}\n` +
          estimatedReady +
          paymentMethod +
          deliveryAddress +
          `🕒 *Ordered:* ${orderedAt}`
        );
      })
      .join("\n\n");

  return sendMessage(
    conversation.restaurantId,
    text(message.from, messageText),
  );
};
