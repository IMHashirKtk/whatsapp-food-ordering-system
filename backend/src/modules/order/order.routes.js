import { Router } from "express";

import validate from "../../middleware/validate.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

import * as orderController from "./order.controller.js";

import {
  checkoutSchema,
  orderIdSchema,
  customerOrdersSchema,
  getOrdersSchema,
  updateStatusSchema,
  updatePaymentStatusSchema,
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
  validate(getOrdersSchema),
  orderController.getOrders,
);

router.get(
  "/customer/:customerId",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(customerOrdersSchema),
  orderController.getCustomerOrders,
);

router.get(
  "/:id",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(orderIdSchema),
  orderController.getOrder,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(orderIdSchema),
  validate(updateStatusSchema),
  orderController.updateStatus,
);

router.patch(
  "/:id/payment-status",
  authenticate,
  authorize("OWNER", "MANAGER"),
  validate(updatePaymentStatusSchema),
  orderController.updatePaymentStatus,
);

export default router;
