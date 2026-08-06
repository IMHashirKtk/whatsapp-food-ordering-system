import { z } from "zod";

const nullableText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must not exceed ${max} characters`);

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Name must not exceed 100 characters")
    .refine(
      (value) => value.length === 0 || value.length >= 2,
      "Name must be at least 2 characters",
    ),
  whatsappId: z
    .string()
    .trim()
    .min(10, "WhatsApp ID must be at least 10 characters")
    .max(20, "WhatsApp ID must not exceed 20 characters"),
  email: z
    .string()
    .trim()
    .max(254, "Email must not exceed 254 characters")
    .refine(
      (value) => value.length === 0 || z.string().email().safeParse(value).success,
      "Please provide a valid email address.",
    ),
  address: nullableText(500, "Address"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export interface CustomerFormPayload {
  name: string | null;
  whatsappId: string;
  email: string | null;
  address: string | null;
}

export const toCustomerFormPayload = (
  values: CustomerFormValues,
): CustomerFormPayload => ({
  name: values.name.trim() || null,
  whatsappId: values.whatsappId.trim(),
  email: values.email.trim() || null,
  address: values.address.trim() || null,
});
