const orderStatusMessages = {
  ACCEPTED: ({ orderNumber }) =>
    `✅ Your order #${orderNumber} has been accepted and will be prepared shortly.`,

  PREPARING: ({ orderNumber }) =>
    `👨‍🍳 Your order #${orderNumber} is now preparing.`,

  READY: ({ orderNumber }) => `🍔 Your order #${orderNumber} is ready.`,

  OUT_FOR_DELIVERY: ({ orderNumber }) =>
    `🛵 Your order #${orderNumber} is out for delivery.`,

  DELIVERED: ({ orderNumber, restaurantName }) =>
    `🎉 Your order #${orderNumber} has been delivered. Thank you for ordering from ${restaurantName}.`,

  CANCELLED: ({ orderNumber, restaurantName, cancellationReason }) =>
    `❌ Your order #${orderNumber} from ${restaurantName} has been cancelled. Reason: ${cancellationReason}`,
};

export const getOrderStatusNotificationMessage = ({
  status,
  orderNumber,
  restaurantName,
  cancellationReason,
}) => {
  const messageFactory = orderStatusMessages[status];

  if (!messageFactory) {
    return null;
  }

  return messageFactory({
    orderNumber,
    restaurantName,
    cancellationReason,
  });
};
