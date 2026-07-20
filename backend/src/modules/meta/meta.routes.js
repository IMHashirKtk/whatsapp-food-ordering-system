import { Router } from "express";
import * as metaController from "./meta.controller.js";

const router = Router();

router.get("/webhook", metaController.verifyWebhook);
router.post("/webhook", metaController.receiveWebhook);

export default router;
