import { Router } from "express";

import * as controller from "./option.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import { authenticate } from "../../auth/auth.middleware.js";

import {
  createOptionSchema,
  updateOptionSchema,
  idSchema,
  optionGroupIdSchema,
} from "./option.validation.js";

const router = Router();

router.get("/", asyncHandler(controller.getAll));

router.get("/:id", validate(idSchema), asyncHandler(controller.getById));

router.get(
  "/group/:optionGroupId",
  validate(optionGroupIdSchema),
  asyncHandler(controller.getByGroup),
);

router.post(
  "/",
  authenticate,
  validate(createOptionSchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  validate(idSchema),
  validate(updateOptionSchema),
  asyncHandler(controller.update),
);

router.delete(
  "/:id",
  authenticate,
  validate(idSchema),
  asyncHandler(controller.remove),
);

export default router;
