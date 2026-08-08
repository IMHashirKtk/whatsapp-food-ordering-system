import { z } from "zod";
import { MAX_CART_QUANTITY, parseCartQuantity } from "./cart.rules.js";

const quantitySchema = z.preprocess(
  (value) => parseCartQuantity(value) ?? value,
  z.number().int().min(1).max(MAX_CART_QUANTITY),
);

export const idSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const addItemSchema = z.object({
  body: z.object({
    customerId: z.string().cuid(),

    menuItemId: z.string().cuid(),

    quantity: quantitySchema,

    selectedOptions: z.array(z.string().cuid()).optional().default([]),
  }),
});

export const updateQuantitySchema = z.object({
  body: z.object({
    quantity: quantitySchema,
  }),
});

export const customerIdSchema = z.object({
  params: z.object({
    customerId: z.string().cuid(),
  }),
});
