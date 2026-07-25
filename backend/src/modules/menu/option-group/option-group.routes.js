import { Router } from "express";

import * as controller from "./option-group.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import authenticate from "../../../middleware/authenticate.js";
import authorize from "../../../middleware/authorize.js";

import {
  createOptionGroupSchema,
  updateOptionGroupSchema,
  idSchema,
  menuItemIdSchema,
} from "./option-group.validation.js";

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
  "/menu-item/:menuItemId",
  authenticate,
  validate(menuItemIdSchema),
  asyncHandler(controller.getByMenuItem),
);

/* ==========================
   Write
========================== */

router.post(
  "/",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(createOptionGroupSchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(idSchema),
  validate(updateOptionGroupSchema),
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
