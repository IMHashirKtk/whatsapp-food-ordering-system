import * as orderService from "./order.service.js";
import asyncHandler from "../../utils/async-handler.js";

/* ==========================
   Checkout
========================== */

export const checkout = asyncHandler(async (req, res) => {
  const { customerId, deliveryAddress, paymentMethod } = req.validated.body;

  const order = await orderService.checkout(
    req.user.restaurantId,
    customerId,
    deliveryAddress,
    paymentMethod,
  );

  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    data: order,
  });
});

/* ==========================
   Orders
========================== */

export const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.user.restaurantId, req.query);

  res.json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(
    req.params.id,
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: order,
  });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getCustomerOrders(
    req.params.customerId,
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: orders,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason } = req.validated.body;
  const order = await orderService.updateStatus(
    req.params.id,
    req.user.restaurantId,
    status,
    cancellationReason,
  );

  res.json({
    success: true,
    message: "Order status updated successfully.",
    data: order,
  });
});
