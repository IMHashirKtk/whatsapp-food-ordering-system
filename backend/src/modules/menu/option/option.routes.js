import { Router } from "express";

import * as controller from "./option.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import authenticate from "../../../middleware/authenticate.js";
import authorize from "../../../middleware/authorize.js";

import {
  createOptionSchema,
  updateOptionSchema,
  idSchema,
  optionGroupIdSchema,
} from "./option.validation.js";

const router = Router();

/* ==========================
   Read
========================== */

router.get("/", authenticate, asyncHandler(controller.getAll));

router.get(
  "/:id",
  authenticate,
  validate(idSchema),
  asyncHandler(controller.getById),
);

router.get(
  "/group/:optionGroupId",
  authenticate,
  validate(optionGroupIdSchema),
  asyncHandler(controller.getByGroup),
);

/* ==========================
   Write
========================== */

router.post(
  "/",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(createOptionSchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(idSchema),
  validate(updateOptionSchema),
  asyncHandler(controller.update),
);

router.delete(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(idSchema),
  asyncHandler(controller.remove),
);

export default router;
