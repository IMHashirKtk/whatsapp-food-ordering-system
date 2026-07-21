import { Router } from "express";

import * as authController from "./auth.controller.js";

import validate from "../../middleware/validate.js";
import asyncHandler from "../../utils/async-handler.js";

import { loginSchema } from "./auth.validation.js";
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login),
);

router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
