import env from "../config/env.js";
import * as whatsappService from "../services/whatsapp.service.js";

export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.meta.verifyToken) {
    console.log("✅ Webhook verified");

    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

export const receiveWebhook = (req, res) => {
  console.log("================================");
  console.log("WEBHOOK RECEIVED");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("================================");

  res.sendStatus(200);
};
