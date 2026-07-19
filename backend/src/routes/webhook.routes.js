import express from "express";
import {
  verifyWebhook,
  receiveWebhook,
} from "../controllers/webhook.controller.js";

const router = express.Router();

// Meta verification request
router.get("/", verifyWebhook);

// Incoming WhatsApp messages
router.post("/", receiveWebhook);

export default router;
