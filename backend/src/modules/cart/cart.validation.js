import { z } from "zod";

export const idSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const addItemSchema = z.object({
  body: z.object({
    customerId: z.string().cuid(),

    menuItemId: z.string().cuid(),

    quantity: z.coerce.number().int().min(1).max(20),

    selectedOptions: z.array(z.string().cuid()).optional().default([]),
  }),
});

export const updateQuantitySchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(1).max(20),
  }),
});

export const customerIdSchema = z.object({
  params: z.object({
    customerId: z.string().cuid(),
  }),
});
