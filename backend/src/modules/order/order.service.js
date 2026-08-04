import * as orderRepository from "./order.repository.js";
import * as cartRepository from "../cart/cart.repository.js";
import * as metaService from "../meta/meta.service.js";
import * as restaurantService from "../restaurant/restaurant.service.js";
import {
  publishOrderCreated,
  publishOrderUpdated,
} from "../../realtime/realtime.publisher.js";

import AppError from "../../utils/AppError.js";
import {
  canCancelOrderStatus,
  canTransitionOrderStatus,
  ORDER_STATUS,
} from "../../constants/orderStatus.js";

const generateOrderNumber = () => {
  return `ORD-${Date.now()}`;
};

const publishOrderCreatedSafely = (restaurantId, order, customer) => {
  try {
    publishOrderCreated(restaurantId, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: customer?.name ?? null,
      customerWhatsappId: customer?.whatsappId ?? null,
      total: order.total,
    });
  } catch (error) {
    console.error("[Realtime] Failed to publish order:created.", {
      orderId: order.id,
      restaurantId,
      error,
    });
  }
};

const publishOrderUpdatedSafely = (
  restaurantId,
  orderId,
  orderNumber,
  status,
  updatedAt,
) => {
  try {
    publishOrderUpdated(restaurantId, {
      orderId,
      orderNumber,
      status,
      updatedAt,
    });
  } catch (error) {
    console.error("[Realtime] Failed to publish order:updated.", {
      orderId,
      restaurantId,
      error,
    });
  }
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
  const resolvedPaymentMethod = paymentMethod || "COD";
  const paymentStatus =
    resolvedPaymentMethod === "COD" ? "UNPAID" : "PENDING_VERIFICATION";

  const transactionResult = await orderRepository.transaction(async (tx) => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const tax = 0;
    const deliveryFee = 0;
    const total = subtotal + tax + deliveryFee;

    const createdOrder = await orderRepository.createOrderWithCustomerSummary(
      {
        restaurantId,
        orderNumber: generateOrderNumber(),
        customerId,
        deliveryAddress,
        subtotal,
        tax,
        deliveryFee,
        total,
        paymentMethod: resolvedPaymentMethod,
        paymentStatus,
        status: ORDER_STATUS.PENDING,
      },
      tx,
    );

    for (const cartItem of cart.items) {
      const orderItem = await orderRepository.createOrderItem(
        {
          orderId: createdOrder.id,
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

    const { customer, ...order } = createdOrder;

    return {
      order,
      customer,
    };
  });

  publishOrderCreatedSafely(
    restaurantId,
    transactionResult.order,
    transactionResult.customer,
  );

  return transactionResult.order;
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

export const updateStatus = async (
  id,
  restaurantId,
  status,
  cancellationReason,
) => {
  const existingOrder = await getOrder(id, restaurantId);

  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new AppError("Invalid order status.", 400);
  }

  const isCancellation = status === ORDER_STATUS.CANCELLED;

  if (isCancellation && !canCancelOrderStatus(existingOrder.status)) {
    throw new AppError("Order cannot be cancelled at this stage.", 400);
  }

  if (!isCancellation && !canTransitionOrderStatus(existingOrder.status, status)) {
    throw new AppError("Invalid order status transition.", 400);
  }

  const normalizedCancellationReason = cancellationReason?.trim();

  if (isCancellation && (!normalizedCancellationReason || normalizedCancellationReason.length < 3)) {
    throw new AppError("A cancellation reason of at least 3 characters is required.", 400);
  }

  const updatedOrder = await orderRepository.updateStatus(
    id,
    restaurantId,
    existingOrder.status,
    status,
    normalizedCancellationReason,
  );

  if (!updatedOrder) {
    throw new AppError(
      "Order status changed before this update completed.",
      409,
    );
  }

  publishOrderUpdatedSafely(
    restaurantId,
    id,
    existingOrder.orderNumber,
    status,
    updatedOrder?.updatedAt,
  );

  try {
    const restaurant = await restaurantService.getRestaurantById(restaurantId);

    await metaService.sendOrderStatusNotification({
      restaurantId,
      to: existingOrder.customer?.whatsappId,
      status,
      orderNumber: existingOrder.orderNumber,
      restaurantName: restaurant.name,
      cancellationReason: normalizedCancellationReason,
    });
  } catch (error) {
    console.error("Failed to send order status WhatsApp notification.", {
      orderId: id,
      status,
      error,
    });
  }

  return updatedOrder;
};
