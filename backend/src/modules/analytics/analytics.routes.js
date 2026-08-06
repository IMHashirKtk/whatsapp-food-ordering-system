import { Router } from "express";

import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";
import validate from "../../middleware/validate.js";
import asyncHandler from "../../utils/async-handler.js";
import * as controller from "./analytics.controller.js";
import {
  customersSchema,
  operationsSchema,
  overviewSchema,
  productsSchema,
  trendsSchema,
} from "./analytics.validation.js";

const router = Router();

router.use(authenticate);
router.use(authorize("OWNER", "MANAGER"));

router.get(
  "/overview",
  validate(overviewSchema),
  asyncHandler(controller.getOverview),
);

router.get(
  "/trends",
  validate(trendsSchema),
  asyncHandler(controller.getTrends),
);

router.get(
  "/products",
  validate(productsSchema),
  asyncHandler(controller.getProducts),
);

router.get(
  "/operations",
  validate(operationsSchema),
  asyncHandler(controller.getOperations),
);

router.get(
  "/customers",
  validate(customersSchema),
  asyncHandler(controller.getCustomers),
);

export default router;
