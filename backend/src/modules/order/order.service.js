import * as orderRepository from "./order.repository.js";
import * as cartRepository from "../cart/cart.repository.js";

import AppError from "../../utils/AppError.js";
import { ORDER_STATUS } from "../../constants/orderStatus.js";

const generateOrderNumber = () => {
  return `ORD-${Date.now()}`;
};

/* ==========================
   Checkout
========================== */

export const checkout = async (customerId, deliveryAddress) => {
  const cart = await cartRepository.getCart(customerId);

  if (!cart) {
    throw new AppError("Cart not found.", 404);
  }

  if (cart.items.length === 0) {
    throw new AppError("Cart is empty.", 400);
  }

  return orderRepository.transaction(async (tx) => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const tax = 0;
    const deliveryFee = 0;
    const total = subtotal + tax + deliveryFee;

    const order = await orderRepository.createOrder(
      {
        orderNumber: generateOrderNumber(),
        customerId,
        deliveryAddress,
        subtotal,
        tax,
        deliveryFee,
        total,
        status: ORDER_STATUS.PENDING,
      },
      tx,
    );

    for (const cartItem of cart.items) {
      const orderItem = await orderRepository.createOrderItem(
        {
          orderId: order.id,
          menuItemId: cartItem.menuItemId,
          quantity: cartItem.quantity,
          basePrice: cartItem.basePrice,
          totalPrice: cartItem.totalPrice,
        },
        tx,
      );

      for (const option of cartItem.options) {
        await orderRepository.createOrderItemOption(
          {
            orderItemId: orderItem.id,
            optionId: option.optionId,
            name: option.name,
            extraPrice: option.extraPrice,
          },
          tx,
        );
      }
    }

    await cartRepository.clearCartTx(tx, cart.id);

    return order;
  });
};

/* ==========================
   Orders
========================== */

export const getOrder = async (id) => {
  const order = await orderRepository.getOrderById(id);

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  return order;
};

export const getCustomerOrders = (customerId) => {
  return orderRepository.getCustomerOrders(customerId);
};

export const updateStatus = async (id, status) => {
  await getOrder(id);

  return orderRepository.updateStatus(id, status);
};
