import express from "express";

import * as controller from "./settings.controller.js";

import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

import validate from "../../middleware/validate.js";

import {
  updateSettingsSchema,
  updateMetaSettingsSchema,
  updateAISettingsSchema,
} from "./settings.validation.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("OWNER", "MANAGER"), controller.getSettings);

router.patch(
  "/",
  authorize("OWNER"),
  validate(updateSettingsSchema),
  controller.updateSettings,
);

router.patch(
  "/meta",
  authorize("OWNER"),
  validate(updateMetaSettingsSchema),
  controller.updateMetaSettings,
);

router.patch(
  "/ai",
  authorize("OWNER"),
  validate(updateAISettingsSchema),
  controller.updateAISettings,
);

export default router;
