export const formatCart = (cart) => {
  if (!cart || cart.items.length === 0) {
    return "🛒 Your cart is empty.";
  }

  let message = "🛒 *Your Cart*\n\n";

  let grandTotal = 0;

  cart.items.forEach((item, index) => {
    message += `${index + 1}. *${item.menuItem.name}*\n`;
    message += `   Qty: ${item.quantity}\n`;

    if (item.options.length) {
      message += "   Options:\n";

      item.options.forEach((option) => {
        message += `   • ${option.name}`;

        if (Number(option.extraPrice) > 0) {
          message += ` (+Rs ${option.extraPrice})`;
        }

        message += "\n";
      });
    }

    message += `   Total: Rs ${item.totalPrice}\n\n`;

    grandTotal += Number(item.totalPrice);
  });

  message += `----------------------\n`;
  message += `*Grand Total: Rs ${grandTotal}*`;

  return message;
};
