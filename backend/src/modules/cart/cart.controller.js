import * as cartService from "./cart.service.js";
import asyncHandler from "../../utils/async-handler.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.params.customerId);

  res.json({
    success: true,
    data: cart,
  });
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.body);

  res.status(201).json({
    success: true,
    message: "Item added to cart.",
    data: cart,
  });
});

export const updateQuantity = asyncHandler(async (req, res) => {
  const item = await cartService.updateQuantity(
    req.params.id,
    req.body.quantity,
  );

  res.json({
    success: true,
    data: item,
  });
});

export const removeItem = asyncHandler(async (req, res) => {
  await cartService.removeItem(req.params.id);

  res.json({
    success: true,
    message: "Item removed from cart.",
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.params.customerId);

  res.json({
    success: true,
    message: "Cart cleared.",
  });
});
