import { z } from "zod";

export const createCustomerSchema = z.object({
  whatsappId: z
    .string()
    .min(10, "WhatsApp ID must be at least 10 characters")
    .max(20, "WhatsApp ID must not exceed 20 characters"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
});

export const updateCustomerSchema = z
  .object({
    whatsappId: z
      .string()
      .min(10, "WhatsApp ID must be at least 10 characters")
      .max(20, "WhatsApp ID must not exceed 20 characters")
      .optional(),

    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided.",
  );
