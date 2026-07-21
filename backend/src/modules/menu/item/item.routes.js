import { Router } from "express";

import * as controller from "./item.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import { authenticate } from "../../auth/auth.middleware.js";

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

router.get("/", asyncHandler(controller.getAll));

router.get("/:id", validate(idSchema), asyncHandler(controller.getById));

router.get(
  "/category/:categoryId",
  validate(categoryIdSchema),
  asyncHandler(controller.getByCategory),
);

/* ==========================
   Write
========================== */

router.post(
  "/",
  authenticate,
  validate(createMenuItemSchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  validate(idSchema),
  validate(updateMenuItemSchema),
  asyncHandler(controller.update),
);

router.delete(
  "/:id",
  authenticate,
  validate(idSchema),
  asyncHandler(controller.remove),
);

export default router;
