import { Router } from "express";

import * as controller from "./category.controller.js";

import asyncHandler from "../../../utils/async-handler.js";
import validate from "../../../middleware/validate.js";
import authenticate from "../../../middleware/authenticate.js";
import authorize from "../../../middleware/authorize.js";

import {
  createCategorySchema,
  updateCategorySchema,
  idSchema,
} from "./category.validation.js";

const router = Router();

/* ==========================
   Read
========================== */

router.get(
  "/",
  authenticate,
  authorize("OWNER", "MANAGER"),
  asyncHandler(controller.getAll),
);

router.get(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(idSchema),
  asyncHandler(controller.getById),
);

/* ==========================
   Write
========================== */

router.post(
  "/",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(createCategorySchema),
  asyncHandler(controller.create),
);

router.put(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(idSchema),
  validate(updateCategorySchema),
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
