import { randomBytes } from "node:crypto";

import * as orderRepository from "./order.repository.js";
import * as customerRepository from "../customer/customer.repository.js";
import * as cartRepository from "../cart/cart.repository.js";
import * as menuService from "../menu/menu.service.js";
import * as metaService from "../meta/meta.service.js";
import * as restaurantService from "../restaurant/restaurant.service.js";
import * as settingsRepository from "../settings/settings.repository.js";
import { isValidCartQuantity } from "../cart/cart.rules.js";
import { validateSelectedOptions } from "../menu/option-selection.service.js";
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

const isTransactionConflict = (error) => error?.code === "P2034";

export const CHECKOUT_ERROR_CODES = Object.freeze({
  CART_INVALID: "CHECKOUT_CART_INVALID",
  RECONFIRM_REQUIRED: "CHECKOUT_RECONFIRM_REQUIRED",
});

const checkoutConflict = (message, code) => {
  const error = new AppError(message, 409);
  error.code = code;
  return error;
};

const hasCartItemSnapshotChanged = (cartItem, current) => {
  if (
    toCents(cartItem.basePrice) !== toCents(current.basePrice) ||
    toCents(cartItem.totalPrice) !== toCents(current.totalPrice) ||
    cartItem.options.length !== current.options.length
  ) {
    return true;
  }

  const currentOptionsById = new Map(
    current.options.map((option) => [option.id, option]),
  );

  return cartItem.options.some((option) => {
    const currentOption = currentOptionsById.get(option.optionId);

    return (
      !currentOption ||
      currentOption.name !== option.name ||
      toCents(currentOption.extraPrice) !== toCents(option.extraPrice)
    );
  });
};

const revalidateCart = async (tx, cart, restaurantId) => {
  const menuItems = await menuService.getMenuItemsForCheckout(
    [...new Set(cart.items.map((item) => item.menuItemId))],
    restaurantId,
    tx,
  );
  const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));
  let snapshotChanged = false;
  const items = [];

  for (const cartItem of cart.items) {
    const menuItem = menuItemsById.get(cartItem.menuItemId);

    if (
      !menuItem ||
      menuItem.isAvailable !== true ||
      !menuItem.category?.isActive
    ) {
      throw checkoutConflict(
        `${cartItem.menuItem?.name || "An item in your cart"} is no longer available. Please review your cart.`,
        CHECKOUT_ERROR_CODES.CART_INVALID,
      );
    }

    if (!isValidCartQuantity(cartItem.quantity)) {
      throw checkoutConflict(
        `${menuItem.name} has an invalid quantity. Please update your cart.`,
        CHECKOUT_ERROR_CODES.CART_INVALID,
      );
    }

    let selectedOptions;

    try {
      selectedOptions = validateSelectedOptions(
        menuItem,
        cartItem.options.map((option) => option.optionId),
      );
    } catch {
      throw checkoutConflict(
        `${menuItem.name} has unavailable or invalid options. Please review your cart.`,
        CHECKOUT_ERROR_CODES.CART_INVALID,
      );
    }

    const basePriceCents = toCents(menuItem.basePrice);
    const optionsTotalCents = selectedOptions.selectedOptions.reduce(
      (total, option) => total + toCents(option.extraPrice),
      0,
    );
    const current = {
      basePrice: menuItem.basePrice,
      totalPrice: fromCents(
        (basePriceCents + optionsTotalCents) * cartItem.quantity,
      ),
      options: selectedOptions.selectedOptions,
    };

    if (hasCartItemSnapshotChanged(cartItem, current)) {
      snapshotChanged = true;

      await cartRepository.updateCartItemSnapshot(tx, cartItem.id, {
        basePrice: current.basePrice,
        totalPrice: current.totalPrice,
        options: current.options,
      });
    }

    items.push({
      ...cartItem,
      menuItem,
      basePrice: current.basePrice,
      totalPrice: current.totalPrice,
      options: current.options,
    });
  }

  return { items, snapshotChanged };
};

const createCheckoutTransaction = async ({
  restaurantId,
  customerId,
  deliveryAddress,
  paymentMethod,
  paymentStatus,
  sourceMessageId,
  checkoutSettings,
}) => {
  const maxOrderNumberAttempts = 0x10000;

  for (let attempt = 0; attempt < maxOrderNumberAttempts; attempt += 1) {
    try {
      return await orderRepository.transaction(async (tx) => {
        const cart = await cartRepository.getCart(
          customerId,
          restaurantId,
          tx,
        );

        if (!cart) {
          throw new AppError("Cart not found.", 404);
        }

        if (cart.items.length === 0) {
          throw new AppError("Cart is empty.", 400);
        }

        const revalidatedCart = await revalidateCart(
          tx,
          cart,
          restaurantId,
        );

        if (revalidatedCart.snapshotChanged) {
          return { reconfirm: true };
        }

        const totals = calculateCheckoutTotals(
          revalidatedCart.items,
          checkoutSettings,
        );

        if (totals.isBelowMinimum) {
          throw new AppError(
            `The minimum order amount is ${formatCurrency(
              totals.minimumOrderAmount,
              checkoutSettings.settings.currencySymbol,
            )}.`,
            400,
          );
        }

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

        for (const cartItem of revalidatedCart.items) {
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
                optionId: option.optionId ?? option.id,
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
      }, { isolationLevel: "Serializable" });
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

      if (
        (!isOrderNumberConflict(error) && !isTransactionConflict(error)) ||
        attempt === maxOrderNumberAttempts - 1
      ) {
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

  const paymentStatus =
    paymentMethod === "COD" ? "UNPAID" : "PENDING_VERIFICATION";

  const transactionResult = await createCheckoutTransaction({
    restaurantId,
    customerId,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
    sourceMessageId,
    checkoutSettings,
  });

  if (transactionResult.reconfirm) {
    throw checkoutConflict(
      "Menu prices changed. Please review your updated cart and confirm the order again.",
      CHECKOUT_ERROR_CODES.RECONFIRM_REQUIRED,
    );
  }

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
