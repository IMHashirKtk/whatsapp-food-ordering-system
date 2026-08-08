import { randomBytes } from "node:crypto";

import * as orderRepository from "./order.repository.js";
import * as customerRepository from "../customer/customer.repository.js";
import * as cartRepository from "../cart/cart.repository.js";
import * as metaService from "../meta/meta.service.js";
import * as restaurantService from "../restaurant/restaurant.service.js";
import * as settingsRepository from "../settings/settings.repository.js";
import {
  formatCurrency,
  getUsablePaymentMethods,
  validateSelectedPaymentMethod,
} from "../conversation/payment.helper.js";
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

let orderNumberSuffixCounter = randomBytes(2).readUInt16BE(0);

export const generateOrderNumber = (orderPrefix, now = new Date()) => {
  const prefix =
    orderPrefix
      ?.trim()
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 20)
      .toUpperCase() || "ORD";
  const year = String(now.getUTCFullYear()).slice(-2);
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const suffix = orderNumberSuffixCounter
    .toString(16)
    .padStart(4, "0")
    .toUpperCase();
  orderNumberSuffixCounter = (orderNumberSuffixCounter + 1) % 0x10000;

  return `${prefix}-${year}${month}${day}-${suffix}`;
};

const isOrderNumberConflict = (error) => {
  if (error?.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  return Array.isArray(target)
    ? target.includes("orderNumber")
    : String(target || "").includes("orderNumber");
};

const isSourceMessageConflict = (error) => {
  if (error?.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  return Array.isArray(target)
    ? target.includes("sourceMessageId")
    : String(target || "").includes("sourceMessageId");
};

const createCheckoutTransaction = async ({
  restaurantId,
  customerId,
  deliveryAddress,
  paymentMethod,
  paymentStatus,
  sourceMessageId,
  checkoutSettings,
  cart,
  totals,
}) => {
  const maxOrderNumberAttempts = 0x10000;

  for (let attempt = 0; attempt < maxOrderNumberAttempts; attempt += 1) {
    try {
      return await orderRepository.transaction(async (tx) => {
        const createdOrder = await orderRepository.createOrderWithCustomerSummary(
          {
            restaurantId,
            orderNumber: generateOrderNumber(
              checkoutSettings.settings.orderPrefix,
            ),
            customerId,
            deliveryAddress,
            subtotal: totals.subtotal,
            tax: totals.tax,
            deliveryFee: totals.deliveryFee,
            total: totals.total,
            paymentMethod,
            paymentStatus,
            sourceMessageId,
            status: ORDER_STATUS.PENDING,
            estimatedReadyTime:
              checkoutSettings.settings.estimatedPreparationTime,
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

        await orderRepository.updateCustomerStats(
          customerId,
          restaurantId,
          totals.total,
          tx,
        );

        await cartRepository.clearCartTx(tx, cart.id);

        const { customer, ...order } = createdOrder;

        return {
          order,
          customer,
          created: true,
        };
      });
    } catch (error) {
      if (isSourceMessageConflict(error) && sourceMessageId) {
        const existingOrder = await orderRepository.getOrderBySourceMessageId(
          sourceMessageId,
          restaurantId,
          customerId,
        );

        if (existingOrder) {
          return {
            order: existingOrder,
            customer: existingOrder.customer,
            created: false,
          };
        }
      }

      if (!isOrderNumberConflict(error) || attempt === maxOrderNumberAttempts - 1) {
        throw error;
      }
    }
  }

  throw new AppError("Unable to generate a unique order number.", 503);
};

const toCents = (value) => Math.round(Number(value || 0) * 100);

const fromCents = (value) => Number((value / 100).toFixed(2));

export const calculateCheckoutTotals = (cartItems, checkoutSettings) => {
  const restaurant = checkoutSettings?.restaurant || checkoutSettings;
  const settings = checkoutSettings?.settings;

  if (!restaurant || !settings) {
    throw new AppError("Checkout is temporarily unavailable.", 503);
  }

  const subtotalCents = cartItems.reduce(
    (sum, item) => sum + toCents(item.totalPrice),
    0,
  );
  const minimumOrderAmountCents = toCents(settings.minimumOrderAmount);
  const configuredDeliveryFeeCents = toCents(restaurant.deliveryFee);
  const freeDeliveryThresholdCents = toCents(settings.freeDeliveryThreshold);
  const taxRateBasisPoints = Math.round(Number(restaurant.taxRate || 0) * 100);
  const taxCents = Math.round((subtotalCents * taxRateBasisPoints) / 10000);
  const deliveryFeeCents =
    freeDeliveryThresholdCents > 0 &&
    subtotalCents >= freeDeliveryThresholdCents
      ? 0
      : configuredDeliveryFeeCents;

  return {
    subtotal: fromCents(subtotalCents),
    tax: fromCents(taxCents),
    deliveryFee: fromCents(deliveryFeeCents),
    total: fromCents(subtotalCents + taxCents + deliveryFeeCents),
    minimumOrderAmount: fromCents(minimumOrderAmountCents),
    isBelowMinimum: subtotalCents < minimumOrderAmountCents,
  };
};

const loadAndValidateCheckoutSettings = async (restaurantId, paymentMethod) => {
  const checkoutSettings =
    await settingsRepository.getCheckoutSettings(restaurantId);

  if (!checkoutSettings?.settings) {
    console.error("Checkout settings are missing for restaurant.", {
      restaurantId,
    });
    throw new AppError("Checkout is temporarily unavailable.", 503);
  }

  if (checkoutSettings.isOpen !== true) {
    throw new AppError(
      "Online ordering is temporarily unavailable. Please try again later.",
      409,
    );
  }

  if (checkoutSettings.settings.orderAcceptanceEnabled !== true) {
    throw new AppError(
      "Online ordering is temporarily unavailable. Please try again later.",
      409,
    );
  }

  if (!paymentMethod) {
    throw new AppError("Please select an available payment method.", 400);
  }

  if (getUsablePaymentMethods(checkoutSettings).length === 0) {
    console.error("No usable payment methods are configured.", {
      restaurantId,
    });
    throw new AppError("Payment methods are temporarily unavailable.", 409);
  }

  if (!validateSelectedPaymentMethod(paymentMethod, checkoutSettings)) {
    throw new AppError(
      "The selected payment method is no longer available.",
      400,
    );
  }

  return checkoutSettings;
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
      error: error?.message,
    });
  }
};

const publishOrderUpdatedSafely = (
  restaurantId,
  orderId,
  orderNumber,
  status,
  updatedAt,
  paymentStatus,
  paymentVerifiedAt,
) => {
  try {
    publishOrderUpdated(restaurantId, {
      orderId,
      orderNumber,
      status,
      updatedAt,
      paymentStatus,
      paymentVerifiedAt,
    });
  } catch (error) {
    console.error("[Realtime] Failed to publish order:updated.", {
      orderId,
      restaurantId,
      error: error?.message,
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
  sourceMessageId = null,
) => {
  if (sourceMessageId) {
    const existingOrder = await orderRepository.getOrderBySourceMessageId(
      sourceMessageId,
      restaurantId,
      customerId,
    );

    if (existingOrder) {
      return existingOrder;
    }
  }

  if (!deliveryAddress || !deliveryAddress.trim()) {
    throw new AppError("Delivery address is required.", 400);
  }

  const checkoutSettings = await loadAndValidateCheckoutSettings(
    restaurantId,
    paymentMethod,
  );

  const cart = await cartRepository.getCart(customerId, restaurantId);

  if (!cart) {
    throw new AppError("Cart not found.", 404);
  }

  if (cart.items.length === 0) {
    throw new AppError("Cart is empty.", 400);
  }

  const paymentStatus =
    paymentMethod === "COD" ? "UNPAID" : "PENDING_VERIFICATION";
  const totals = calculateCheckoutTotals(cart.items, checkoutSettings);

  if (totals.isBelowMinimum) {
    throw new AppError(
      `The minimum order amount is ${formatCurrency(
        totals.minimumOrderAmount,
        checkoutSettings.settings.currencySymbol,
      )}.`,
      400,
    );
  }

  const transactionResult = await createCheckoutTransaction({
    restaurantId,
    customerId,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
    sourceMessageId,
    checkoutSettings,
    cart,
    totals,
  });

  if (transactionResult.created !== false) {
    publishOrderCreatedSafely(
      restaurantId,
      transactionResult.order,
      transactionResult.customer,
    );
  }

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

const ensureCustomerBelongsToRestaurant = async (customerId, restaurantId) => {
  const customer = await customerRepository.getById(customerId, restaurantId);

  if (!customer) {
    throw new AppError("Customer not found.", 404);
  }

  return customer;
};

export const getCustomerOrders = async (
  customerId,
  restaurantId,
  filters = {},
) => {
  await ensureCustomerBelongsToRestaurant(customerId, restaurantId);

  return orderRepository.getCustomerOrders(customerId, restaurantId, filters);
};

export const getPaginatedCustomerOrders = async (
  customerId,
  restaurantId,
  query = {},
) => {
  await ensureCustomerBelongsToRestaurant(customerId, restaurantId);

  const page = query.page || 1;
  const limit = query.limit || 20;
  const { status, paymentStatus } = query;

  const [orders, total] = await Promise.all([
    orderRepository.getCustomerOrdersPage({
      customerId,
      restaurantId,
      page,
      limit,
      status,
      paymentStatus,
    }),
    orderRepository.countCustomerOrders({
      customerId,
      restaurantId,
      status,
      paymentStatus,
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
      error: error?.message,
    });
  }

  return updatedOrder;
};

export const updatePaymentStatus = async (
  id,
  restaurantId,
  paymentVerifiedBy,
  paymentStatus,
  note,
) => {
  const existingOrder = await getOrder(id, restaurantId);

  if (existingOrder.paymentStatus === "PAID") {
    throw new AppError(
      "Payment is already verified and cannot be changed.",
      409,
    );
  }

  if (paymentStatus !== "PAID") {
    throw new AppError(
      "Payment can only be changed to PAID during manual verification.",
      400,
    );
  }

  if (!["UNPAID", "PENDING_VERIFICATION"].includes(existingOrder.paymentStatus)) {
    throw new AppError("Payment status transition is not allowed.", 409);
  }

  const normalizedNote = note?.trim() || null;
  const updatedOrder = await orderRepository.transaction((tx) =>
    orderRepository.updatePaymentStatus(
      id,
      restaurantId,
      existingOrder.paymentStatus,
      paymentStatus,
      paymentVerifiedBy,
      normalizedNote,
      tx,
    ),
  );

  if (!updatedOrder) {
    throw new AppError(
      "Payment status changed before this update completed.",
      409,
    );
  }

  publishOrderUpdatedSafely(
    restaurantId,
    id,
    updatedOrder.orderNumber,
    updatedOrder.status,
    updatedOrder.updatedAt,
    updatedOrder.paymentStatus,
    updatedOrder.paymentVerifiedAt,
  );

  return updatedOrder;
};
