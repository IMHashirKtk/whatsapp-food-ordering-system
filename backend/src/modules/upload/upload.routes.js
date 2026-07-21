import { Router } from "express";
import upload from "../../middleware/upload.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", authenticate, upload.single("image"), (req, res) => {
  return res.json({
    success: true,
    message: "Image uploaded successfully.",
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

export default router;
