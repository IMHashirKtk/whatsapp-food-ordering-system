import { Router } from "express";

import * as controller from "./cart.controller.js";
import validate from "../../middleware/validate.js";

import {
  idSchema,
  addItemSchema,
  updateQuantitySchema,
  customerIdSchema,
} from "./cart.validation.js";

const router = Router();

router.get("/:customerId", validate(customerIdSchema), controller.getCart);

router.post("/items", validate(addItemSchema), controller.addItem);

router.patch(
  "/items/:id",
  validate(idSchema),
  validate(updateQuantitySchema),
  controller.updateQuantity,
);

router.delete("/items/:id", validate(idSchema), controller.removeItem);

router.delete("/:customerId", validate(customerIdSchema), controller.clearCart);

export default router;
