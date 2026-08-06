import { z } from "zod";

const nullableText = (max: number) =>
  z.string().max(max, `Cannot exceed ${max} characters.`);

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format.")
  .or(z.literal(""));

const phone = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, "Use an international phone number.")
  .or(z.literal(""));

const email = z.string().email("Enter a valid email address.").or(z.literal(""));

export const profileSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Restaurant name is required.")
    .max(120, "Restaurant name cannot exceed 120 characters."),
  description: nullableText(5000),
  imageUrl: nullableText(2048),
  address: nullableText(500),
  phone,
  whatsappNumber: phone,
  email,
  currency: z.string().trim().min(1).max(10),
  taxRate: z
    .number()
    .finite("Tax rate must be a number.")
    .min(0, "Tax rate cannot be negative.")
    .max(100, "Tax rate cannot exceed 100%."),
  deliveryFee: z
    .number()
    .finite("Delivery fee must be a number.")
    .min(0, "Delivery fee cannot be negative."),
  openingTime: time,
  closingTime: time,
  isOpen: z.boolean(),
});

export const orderConfigSchema = z.object({
  freeDeliveryThreshold: z
    .number()
    .finite("Free-delivery threshold must be a number.")
    .min(0, "Free-delivery threshold cannot be negative."),
  minimumOrderAmount: z
    .number()
    .finite("Minimum order amount must be a number.")
    .min(0, "Minimum order amount cannot be negative."),
  estimatedPreparationTime: z
    .number()
    .int("Preparation time must be a whole number.")
    .min(1, "Preparation time must be at least 1 minute.")
    .max(1440, "Preparation time cannot exceed 24 hours."),
  orderAcceptanceEnabled: z.boolean(),
  temporaryClosureMessage: nullableText(1000),
  orderPrefix: z.string().trim().min(1).max(20),
  autoAcceptOrders: z.boolean(),
});

export const paymentMethodsSchema = z
  .object({
    codEnabled: z.boolean(),
    easypaisaEnabled: z.boolean(),
    easypaisaNumber: nullableText(50),
    jazzcashEnabled: z.boolean(),
    jazzcashNumber: nullableText(50),
    bankTransferEnabled: z.boolean(),
    bankName: nullableText(120),
    bankAccountTitle: nullableText(120),
    bankAccountNumber: nullableText(100),
    paymentInstructions: nullableText(2000),
  })
  .refine(
    (values) =>
      values.codEnabled ||
      values.easypaisaEnabled ||
      values.jazzcashEnabled ||
      values.bankTransferEnabled,
    {
      message: "Keep at least one payment method enabled.",
      path: ["codEnabled"],
    },
  );

export const availabilitySchema = z.object({
  openingTime: time,
  closingTime: time,
  isOpen: z.boolean(),
  orderAcceptanceEnabled: z.boolean(),
  temporaryClosureMessage: nullableText(1000),
});

export const receiptSettingsSchema = z.object({
  receiptFooter: nullableText(1000),
});

export const notificationSettingsSchema = z.object({
  statusNotificationsEnabled: z.boolean(),
  cancellationNotificationsEnabled: z.boolean(),
});

export const localizationSchema = z.object({
  language: z.string().trim().min(2).max(10),
  timezone: z.string().trim().min(1).max(100),
  currencySymbol: z.string().trim().min(1).max(10),
});

export const aiSettingsSchema = z.object({
  aiEnabled: z.boolean(),
  welcomeMessage: nullableText(5000),
  orderConfirmation: nullableText(5000),
});

export const metaSettingsSchema = z.object({
  metaPhoneNumberId: nullableText(100),
  metaDisplayPhone: nullableText(50),
  metaBusinessAccountId: nullableText(100),
  metaAccessToken: nullableText(5000),
  metaVerifyToken: nullableText(5000),
  webhookSecret: nullableText(5000),
});

export type ProfileSettingsFormValues = z.input<typeof profileSettingsSchema>;
export type OrderConfigFormValues = z.input<typeof orderConfigSchema>;
export type PaymentMethodsFormValues = z.input<typeof paymentMethodsSchema>;
export type AvailabilityFormValues = z.input<typeof availabilitySchema>;
export type ReceiptSettingsFormValues = z.input<typeof receiptSettingsSchema>;
export type NotificationSettingsFormValues = z.input<
  typeof notificationSettingsSchema
>;
export type LocalizationFormValues = z.input<typeof localizationSchema>;
export type AISettingsFormValues = z.input<typeof aiSettingsSchema>;
export type MetaSettingsFormValues = z.input<typeof metaSettingsSchema>;
