import { z } from "zod";

const normalizeOptionalText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return normalized || null;
};

const optionalText = (max) =>
  z.preprocess(
    normalizeOptionalText,
    z.string().max(max).nullable().optional(),
  );

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? Number.NaN : value),
  z.coerce.number().finite().nonnegative().optional(),
);

const optionalTaxRate = optionalNumber.refine(
  (value) => value === undefined || value <= 100,
  "Tax rate cannot exceed 100%.",
);

const optionalPhone = z.preprocess(
  normalizeOptionalText,
  z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, "Use an international phone number.")
    .nullable()
    .optional(),
);

const optionalEmail = z.preprocess(
  normalizeOptionalText,
  z.string().email().nullable().optional(),
);

const optionalBoolean = z.boolean().optional();
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm format.")
  .nullable()
  .optional();

const requireAtLeastOneField = (schema) =>
  schema.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export const updateProfileSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      name: z.string().trim().min(1).max(120).optional(),
      description: optionalText(5000),
      imageUrl: optionalText(2048),
      address: optionalText(500),
      phone: optionalPhone,
      whatsappNumber: optionalPhone,
      email: optionalEmail,
      currency: z.string().trim().min(1).max(10).optional(),
      taxRate: optionalTaxRate,
      deliveryFee: optionalNumber,
      openingTime: time,
      closingTime: time,
      isOpen: optionalBoolean,
    }),
  ),
});

export const updateOrderConfigSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      freeDeliveryThreshold: optionalNumber,
      minimumOrderAmount: optionalNumber,
      estimatedPreparationTime: z.coerce.number().int().min(1).max(1440).optional(),
      orderAcceptanceEnabled: optionalBoolean,
      temporaryClosureMessage: optionalText(1000),
      orderPrefix: z.string().trim().min(1).max(20).optional(),
      autoAcceptOrders: optionalBoolean,
    }),
  ),
});

export const updatePaymentMethodsSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      codEnabled: optionalBoolean,
      easypaisaEnabled: optionalBoolean,
      easypaisaNumber: optionalText(50),
      jazzcashEnabled: optionalBoolean,
      jazzcashNumber: optionalText(50),
      bankTransferEnabled: optionalBoolean,
      bankName: optionalText(120),
      bankAccountTitle: optionalText(120),
      bankAccountNumber: optionalText(100),
      paymentInstructions: optionalText(2000),
    }),
  ),
});

export const updateAvailabilitySchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      openingTime: time,
      closingTime: time,
      isOpen: optionalBoolean,
      orderAcceptanceEnabled: optionalBoolean,
      temporaryClosureMessage: optionalText(1000),
    }),
  ),
});

export const updateReceiptSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      receiptFooter: optionalText(1000),
    }),
  ),
});

export const updateNotificationsSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      statusNotificationsEnabled: optionalBoolean,
      cancellationNotificationsEnabled: optionalBoolean,
    }),
  ),
});

export const updateLocalizationSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      language: z.string().trim().min(2).max(10).optional(),
      timezone: z.string().trim().min(1).max(100).optional(),
      currencySymbol: z.string().trim().min(1).max(10).optional(),
    }),
  ),
});

export const updateAISettingsSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      aiEnabled: optionalBoolean,
      welcomeMessage: optionalText(5000),
      orderConfirmation: optionalText(5000),
    }),
  ),
});

export const updateMetaSettingsSchema = z.object({
  body: requireAtLeastOneField(
    z.object({
      metaPhoneNumberId: optionalText(100),
      metaDisplayPhone: optionalText(50),
      metaBusinessAccountId: optionalText(100),
      metaAccessToken: optionalText(5000),
      metaVerifyToken: optionalText(5000),
      webhookSecret: optionalText(5000),
    }),
  ),
});
