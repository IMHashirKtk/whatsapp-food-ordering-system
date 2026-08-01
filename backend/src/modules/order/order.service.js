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

export const checkout = async (
  restaurantId,
  customerId,
  deliveryAddress,
  paymentMethod,
) => {
  if (!deliveryAddress || !deliveryAddress.trim()) {
    throw new AppError("Delivery address is required.", 400);
  }

  const cart = await cartRepository.getCart(customerId, restaurantId);

  if (!cart) {
    throw new AppError("Cart not found.", 404);
  }

  if (cart.items.length === 0) {
    throw new AppError("Cart is empty.", 400);
  }

  // Automatically determine payment status
  const paymentStatus =
    paymentMethod === "COD" ? "UNPAID" : "PENDING_VERIFICATION";

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
        restaurantId,
        orderNumber: generateOrderNumber(),
        customerId,
        deliveryAddress,
        subtotal,
        tax,
        deliveryFee,
        total,
        paymentMethod,
        paymentStatus,
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

    await orderRepository.updateCustomerStats(customerId, total, tx);

    await cartRepository.clearCartTx(tx, cart.id);

    return order;
  });
};

/* ==========================
   Orders
========================== */

export const getOrder = async (id, restaurantId) => {
  const order = await orderRepository.getOrderById(id, restaurantId);

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  return order;
};

export const getCustomerOrders = (customerId, restaurantId) => {
  return orderRepository.getCustomerOrders(customerId, restaurantId);
};

export const getActiveCustomerOrders = (customerId, restaurantId) => {
  return orderRepository.getActiveCustomerOrders(customerId, restaurantId);
};

export const getOrders = async (restaurantId, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;

  const status = query.status;
  const search = query.search?.trim() || undefined;

  const [orders, total] = await Promise.all([
    orderRepository.getOrders({
      restaurantId,
      page,
      limit,
      status,
      search,
    }),
    orderRepository.countOrders({
      restaurantId,
      status,
      search,
    }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateStatus = async (id, restaurantId, status) => {
  await getOrder(id, restaurantId);

  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new AppError("Invalid order status.", 400);
  }

  return orderRepository.updateStatus(id, restaurantId, status);
};
