import express from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "./customer.controller.js";
import authenticate from "../../middleware/authenticate.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("OWNER", "MANAGER"), getAllCustomers);

router.get("/:id", authorize("OWNER", "MANAGER"), getCustomerById);

router.post("/", authorize("OWNER", "MANAGER"), createCustomer);

router.patch("/:id", authorize("OWNER", "MANAGER"), updateCustomer);

router.delete("/:id", authorize("OWNER"), deleteCustomer);

export default router;
