import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import * as customerService from "../services/customer.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validators/customer.validator.js";

export const createCustomer = asyncHandler(async (req, res) => {
  const validation = createCustomerSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const customer = await customerService.createCustomer(validation.data);

  res.status(201).json({
    success: true,
    data: customer,
  });
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await customerService.getAllCustomers();

  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers,
  });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await customerService.getCustomerById(id);

  res.status(200).json({
    success: true,
    data: customer,
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const validation = updateCustomerSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const customer = await customerService.updateCustomer(id, validation.data);

  res.status(200).json({
    success: true,
    data: customer,
  });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await customerService.deleteCustomer(id);

  res.status(200).json({
    success: true,
    ...result,
  });
});
