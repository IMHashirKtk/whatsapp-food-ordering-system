// routes/test.routes.js

import express from "express";
import * as metaService from "../services/meta.service.js";

const router = express.Router();

router.get("/send", async (req, res) => {
  await metaService.sendTextMessage(
    "923119490044", // Your verified WhatsApp number
    "Hello from Foodaji 🚀",
  );

  res.json({ success: true });
});

export default router;
