import { Router } from "express";

import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

import * as orderController from "./order.controller.js";

import {
  checkoutSchema,
  orderIdSchema,
  customerOrdersSchema,
  updateStatusSchema,
} from "./order.validation.js";

const router = Router();

/* ==========================
   Checkout
========================== */

router.post(
  "/checkout",
  authenticate,
  validate(checkoutSchema),
  orderController.checkout,
);

/* ==========================
   Orders
========================== */

router.get(
  "/",
  authenticate,
  authorize("OWNER", "MANAGER"),
  orderController.getOrders,
);

router.get(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(orderIdSchema),
  orderController.getOrder,
);

router.get(
  "/customer/:customerId",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(customerOrdersSchema),
  orderController.getCustomerOrders,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(orderIdSchema),
  validate(updateStatusSchema),
  orderController.updateStatus,
);

export default router;
