import { Router } from "express";

import * as controller from "./dashboard.controller.js";

import asyncHandler from "../../utils/async-handler.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", authenticate, asyncHandler(controller.getDashboard));

export default router;
