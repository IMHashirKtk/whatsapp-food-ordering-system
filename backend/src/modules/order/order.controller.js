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
  const result = await orderService.getOrders(
    req.user.restaurantId,
    req.validated.query,
  );

  res.json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(
    req.validated.params.id,
    req.user.restaurantId,
  );

  res.json({
    success: true,
    data: order,
  });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { customerId } = req.validated.params;
  const query = req.validated.query;

  if (Object.keys(query).length > 0) {
    const result = await orderService.getPaginatedCustomerOrders(
      customerId,
      req.user.restaurantId,
      query,
    );

    return res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  }

  const orders = await orderService.getCustomerOrders(
    customerId,
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
    req.validated.params.id,
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

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, note } = req.validated.body;
  const order = await orderService.updatePaymentStatus(
    req.validated.params.id,
    req.user.restaurantId,
    req.user.id,
    paymentStatus,
    note,
  );

  res.json({
    success: true,
    message: "Payment status updated successfully.",
    data: order,
  });
});
