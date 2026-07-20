import { z } from "zod";

export const checkoutSchema = z.object({
  body: z.object({
    customerId: z.string().cuid(),
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

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ]),
  }),
});
