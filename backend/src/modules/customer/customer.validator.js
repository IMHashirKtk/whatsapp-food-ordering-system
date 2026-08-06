import { z } from "zod";
import { customerOrderQuerySchema } from "../order/order.validation.js";

const normalizeBlank = (value) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const nullableText = (schema) =>
  z.preprocess(normalizeBlank, schema.nullable().optional());

const customerIdParams = z.object({
  id: z.string().cuid(),
});

const customerFields = {
  whatsappId: z
    .string()
    .trim()
    .min(10, "WhatsApp ID must be at least 10 characters")
    .max(20, "WhatsApp ID must not exceed 20 characters"),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: nullableText(
    z
      .string()
      .trim()
      .email("Please provide a valid email address.")
      .max(254, "Email must not exceed 254 characters"),
  ),

  address: nullableText(
    z.string().trim().max(500, "Address must not exceed 500 characters"),
  ),
};

export const createCustomerSchema = z.object({
  body: z.object(customerFields),
});

export const updateCustomerSchema = z.object({
  params: customerIdParams,
  body: z
    .object({
      whatsappId: customerFields.whatsappId.optional(),
      name: nullableText(
        z
          .string()
          .trim()
          .min(2, "Name must be at least 2 characters")
          .max(100, "Name must not exceed 100 characters"),
      ),
      email: customerFields.email,
      address: customerFields.address,
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field must be provided.",
    ),
});

const optionalSearch = z.preprocess(
  (value) =>
    typeof value === "string" ? value.trim() || undefined : value,
  z.string().max(100).optional(),
);

export const customerListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: optionalSearch,
  }),
});

export const customerIdSchema = z.object({
  params: customerIdParams,
});

export const customerOrderHistorySchema = z.object({
  params: customerIdParams,
  query: customerOrderQuerySchema,
});
