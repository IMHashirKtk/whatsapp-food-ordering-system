import { Router } from "express";

import * as controller from "./item.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import authenticate from "../../../middleware/authenticate.js";
import authorize from "../../../middleware/authorize.js";

import {
  createMenuItemSchema,
  updateMenuItemSchema,
  idSchema,
  categoryIdSchema,
} from "./item.validation.js";

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
  "/category/:categoryId",
  authenticate,
  validate(categoryIdSchema),
  asyncHandler(controller.getByCategory),
);

/* ==========================
   Write
========================== */

router.post(
  "/",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(createMenuItemSchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(idSchema),
  validate(updateMenuItemSchema),
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
