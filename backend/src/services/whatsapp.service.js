import * as incomingMessageService from "./incoming-message.service.js";

export const processWebhook = async (payload) => {
  console.log(JSON.stringify(payload, null, 2));
  const change = payload.entry?.[0]?.changes?.[0];

  if (!change || change.field !== "messages") return;

  const value = change.value;
  if (!value.messages) return;

  const contact = value.contacts?.[0];
  const message = value.messages?.[0];

  if (!contact || !message) return;

  const incomingMessage = {
    whatsappId: contact.wa_id,
    customerName: contact.profile?.name || "Unknown",
    messageId: message.id,
    messageType: message.type,
    text: message.text?.body || "",
    timestamp: message.timestamp,
  };

  await incomingMessageService.handleIncomingMessage(incomingMessage);
};
