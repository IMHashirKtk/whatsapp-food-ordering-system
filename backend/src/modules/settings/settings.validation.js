import { z } from "zod";

/* ==========================
   General Settings
========================== */

export const updateSettingsSchema = z.object({
  body: z.object({
    language: z.string().min(2).optional(),

    timezone: z.string().optional(),

    currencySymbol: z.string().max(10).optional(),

    orderPrefix: z.string().max(10).optional(),

    autoAcceptOrders: z.boolean().optional(),

    isConfigured: z.boolean().optional(),
  }),
});

/* ==========================
   Meta Settings
========================== */

export const updateMetaSettingsSchema = z.object({
  body: z.object({
    metaPhoneNumberId: z.string().optional(),

    metaDisplayPhone: z.string().optional(),

    metaBusinessAccountId: z.string().optional(),

    metaAccessToken: z.string().optional(),

    metaVerifyToken: z.string().optional(),

    webhookSecret: z.string().optional(),
  }),
});

/* ==========================
   AI Settings
========================== */

export const updateAISettingsSchema = z.object({
  body: z.object({
    aiEnabled: z.boolean().optional(),

    welcomeMessage: z.string().optional(),

    orderConfirmation: z.string().optional(),
  }),
});
