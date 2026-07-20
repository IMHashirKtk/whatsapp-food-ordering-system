import asyncHandler from "../../utils/asyncHandler.js";
import * as metaService from "./meta.service.js";

export const verifyWebhook = asyncHandler(async (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

export const receiveWebhook = asyncHandler(async (req, res) => {
  await metaService.processWebhook(req.body);

  return res.sendStatus(200);
});
