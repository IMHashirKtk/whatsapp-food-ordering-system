import { Router } from "express";

import * as controller from "./category.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import { authenticate } from "../../auth/auth.middleware.js";

import {
  createCategorySchema,
  updateCategorySchema,
  idSchema,
} from "./category.validation.js";

const router = Router();

/* ==========================
   Read
========================== */

router.get("/", asyncHandler(controller.getAll));

router.get("/:id", validate(idSchema), asyncHandler(controller.getById));

/* ==========================
   Write
========================== */

router.post(
  "/",
  authenticate,
  validate(createCategorySchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  validate(idSchema),
  validate(updateCategorySchema),
  asyncHandler(controller.update),
);

router.delete(
  "/:id",
  authenticate,
  validate(idSchema),
  asyncHandler(controller.remove),
);

export default router;
