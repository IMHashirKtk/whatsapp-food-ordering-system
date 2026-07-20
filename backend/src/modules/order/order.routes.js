import { Router } from "express";

import validate from "../../middleware/validate.js";

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

router.post("/checkout", validate(checkoutSchema), orderController.checkout);

/* ==========================
   Orders
========================== */

router.get("/:id", validate(orderIdSchema), orderController.getOrder);

router.get(
  "/customer/:customerId",
  validate(customerOrdersSchema),
  orderController.getCustomerOrders,
);

router.patch(
  "/:id/status",
  validate(orderIdSchema),
  validate(updateStatusSchema),
  orderController.updateStatus,
);

export default router;
