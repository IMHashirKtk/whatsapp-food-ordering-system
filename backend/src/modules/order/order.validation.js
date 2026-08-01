import { z } from "zod";

export const checkoutSchema = z.object({
  body: z.object({
    customerId: z.string().cuid(),
    deliveryAddress: z.string().trim().min(1).optional(),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const customerOrdersSchema = z.object({
  params: z.object({
    customerId: z.string().cuid(),
  }),
});

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(100).optional(),
    status: z
      .enum([
        "PENDING",
        "ACCEPTED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ])
      .optional(),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.enum([
      "PENDING",
      "ACCEPTED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ]),
  }),
});
