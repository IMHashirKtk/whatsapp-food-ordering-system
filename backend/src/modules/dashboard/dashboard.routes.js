import { Router } from "express";

import * as controller from "./dashboard.controller.js";

import asyncHandler from "../../utils/async-handler.js";
import { authenticate } from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.js";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorize("OWNER", "MANAGER"),
  asyncHandler(controller.getSummary),
);

export default router;
