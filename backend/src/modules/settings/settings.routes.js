import express from "express";

import * as controller from "./settings.controller.js";

import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

import validate from "../../middleware/validate.js";

import {
  updateProfileSchema,
  updateOrderConfigSchema,
  updatePaymentMethodsSchema,
  updateAvailabilitySchema,
  updateReceiptSchema,
  updateNotificationsSchema,
  updateLocalizationSchema,
  updateMetaSettingsSchema,
  updateAISettingsSchema,
} from "./settings.validation.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("OWNER", "MANAGER"), controller.getSettings);

router.patch(
  "/profile",
  authorize("OWNER", "MANAGER"),
  validate(updateProfileSchema),
  controller.updateProfile,
);

router.patch(
  "/order-config",
  authorize("OWNER", "MANAGER"),
  validate(updateOrderConfigSchema),
  controller.updateOrderConfig,
);

router.patch(
  "/payment-methods",
  authorize("OWNER", "MANAGER"),
  validate(updatePaymentMethodsSchema),
  controller.updatePaymentMethods,
);

router.patch(
  "/availability",
  authorize("OWNER", "MANAGER"),
  validate(updateAvailabilitySchema),
  controller.updateAvailability,
);

router.patch(
  "/receipt",
  authorize("OWNER", "MANAGER"),
  validate(updateReceiptSchema),
  controller.updateReceipt,
);

router.patch(
  "/notifications",
  authorize("OWNER", "MANAGER"),
  validate(updateNotificationsSchema),
  controller.updateNotifications,
);

router.patch(
  "/localization",
  authorize("OWNER", "MANAGER"),
  validate(updateLocalizationSchema),
  controller.updateLocalization,
);

router.patch(
  "/ai",
  authorize("OWNER", "MANAGER"),
  validate(updateAISettingsSchema),
  controller.updateAISettings,
);

router.patch(
  "/meta",
  authorize("OWNER"),
  validate(updateMetaSettingsSchema),
  controller.updateMetaSettings,
);

export default router;
