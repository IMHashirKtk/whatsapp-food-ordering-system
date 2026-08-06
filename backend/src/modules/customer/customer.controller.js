import asyncHandler from "../../utils/async-handler.js";
import * as customerService from "./customer.service.js";
import * as orderService from "../order/order.service.js";

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(
    req.user.restaurantId,
    req.validated.body,
  );

  res.status(201).json({
    success: true,
    data: customer,
  });
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getAllCustomers(
    req.user.restaurantId,
    req.validated.query,
  );

  res.status(200).json({
    success: true,
    data: result.customers,
    pagination: result.pagination,
  });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const result = await customerService.getCustomerDetails(
    req.validated.params.id,
    req.user.restaurantId,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getCustomerOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getPaginatedCustomerOrders(
    req.validated.params.id,
    req.user.restaurantId,
    req.validated.query,
  );

  res.status(200).json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(
    req.validated.params.id,
    req.user.restaurantId,
    req.validated.body,
  );

  res.status(200).json({
    success: true,
    data: customer,
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const result = await customerService.deleteCustomer(
    req.validated.params.id,
    req.user.restaurantId,
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: null,
  });
});
