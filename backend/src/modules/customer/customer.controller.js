import asyncHandler from "../../utils/async-handler.js";
import AppError from "../../utils/AppError.js";
import * as customerService from "./customer.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validator.js";

export const createCustomer = asyncHandler(async (req, res) => {
  const validation = createCustomerSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const customer = await customerService.createCustomer(
    req.user.restaurantId,
    validation.data,
  );

  res.status(201).json({
    success: true,
    data: customer,
  });
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await customerService.getAllCustomers(
    req.user.restaurantId,
  );

  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers,
  });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(
    req.params.id,
    req.user.restaurantId,
  );

  res.status(200).json({
    success: true,
    data: customer,
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const validation = updateCustomerSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const customer = await customerService.updateCustomer(
    req.params.id,
    req.user.restaurantId,
    validation.data,
  );

  res.status(200).json({
    success: true,
    data: customer,
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const result = await customerService.deleteCustomer(
    req.params.id,
    req.user.restaurantId,
  );

  res.status(200).json({
    success: true,
    ...result,
  });
});
