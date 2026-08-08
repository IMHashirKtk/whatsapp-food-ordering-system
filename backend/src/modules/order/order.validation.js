import { z } from "zod";

export const checkoutSchema = z.object({
  body: z.object({
    customerId: z.string().cuid(),
    deliveryAddress: z.string().trim().min(1).optional(),
    paymentMethod: z
      .enum(["EASYPAISA", "JAZZCASH", "BANK_TRANSFER", "COD"])
      .optional(),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

const orderStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

const paymentStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "UNPAID",
  "PAID",
]);

const pageSchema = z.coerce.number().int().min(1);
const limitSchema = z.coerce.number().int().min(1).max(100);

export const customerOrderQuerySchema = z.object({
  page: pageSchema.default(1),
  limit: limitSchema.default(20),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
});

export const legacyCustomerOrderQuerySchema = z.object({
  page: pageSchema.optional(),
  limit: limitSchema.optional(),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
});

export const customerOrdersSchema = z.object({
  params: z.object({
    customerId: z.string().cuid(),
  }),
  query: legacyCustomerOrderQuerySchema,
});

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().max(100).optional(),
    status: orderStatusSchema.optional(),
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
    cancellationReason: z.string().trim().min(3).max(500).optional(),
  }),
});

export const updatePaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    paymentStatus: paymentStatusSchema,
    note: z.string().trim().max(500).optional(),
  }),
});
