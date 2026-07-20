import * as orderService from "./order.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

/* ==========================
   Checkout
========================== */

export const checkout = asyncHandler(async (req, res) => {
  const { customerId } = req.body;

  const order = await orderService.checkout(customerId);

  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    data: order,
  });
});

/* ==========================
   Orders
========================== */

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.params.id);

  res.json({
    success: true,
    data: order,
  });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getCustomerOrders(req.params.customerId);

  res.json({
    success: true,
    data: orders,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status);

  res.json({
    success: true,
    message: "Order status updated successfully.",
    data: order,
  });
});
