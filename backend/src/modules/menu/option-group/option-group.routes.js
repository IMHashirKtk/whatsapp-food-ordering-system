import { Router } from "express";

import * as controller from "./option-group.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import { authenticate } from "../../auth/auth.middleware.js";

import {
  createOptionGroupSchema,
  updateOptionGroupSchema,
  idSchema,
  menuItemIdSchema,
} from "./option-group.validation.js";

const router = Router();

router.get("/", asyncHandler(controller.getAll));

router.get("/:id", validate(idSchema), asyncHandler(controller.getById));

router.get(
  "/menu-item/:menuItemId",
  validate(menuItemIdSchema),
  asyncHandler(controller.getByMenuItem),
);

router.post(
  "/",
  authenticate,
  validate(createOptionGroupSchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  validate(idSchema),
  validate(updateOptionGroupSchema),
  asyncHandler(controller.update),
);

router.delete(
  "/:id",
  authenticate,
  validate(idSchema),
  asyncHandler(controller.remove),
);

export default router;
