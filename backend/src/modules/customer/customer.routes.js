import express from "express";
import * as customerController from "./customer.controller.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";
import validate from "../../middleware/validate.js";
import {
  createCustomerSchema,
  customerIdSchema,
  customerListSchema,
  customerOrderHistorySchema,
  updateCustomerSchema,
} from "./customer.validator.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize("OWNER", "MANAGER"),
  validate(customerListSchema),
  customerController.getAllCustomers,
);

router.get(
  "/:id/orders",
  authorize("OWNER", "MANAGER"),
  validate(customerOrderHistorySchema),
  customerController.getCustomerOrders,
);

router.get(
  "/:id",
  authorize("OWNER", "MANAGER"),
  validate(customerIdSchema),
  customerController.getCustomerById,
);

router.post(
  "/",
  authorize("OWNER", "MANAGER"),
  validate(createCustomerSchema),
  customerController.createCustomer,
);

router.patch(
  "/:id",
  authorize("OWNER", "MANAGER"),
  validate(updateCustomerSchema),
  customerController.updateCustomer,
);

router.delete(
  "/:id",
  authorize("OWNER"),
  validate(customerIdSchema),
  customerController.deleteCustomer,
);

export default router;
