import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "WhatsApp Food Ordering API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
