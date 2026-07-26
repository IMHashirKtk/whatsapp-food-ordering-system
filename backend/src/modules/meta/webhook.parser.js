import { parseCommand } from "./command.parser.js";

export const parseWebhook = (payload) => {
  const entry = payload?.entry?.[0];
  if (!entry) return null;

  const change = entry.changes?.[0];
  if (!change) return null;

  const value = change.value;

  const message = value?.messages?.[0];
  if (!message) return null;

  const buttonReply =
    message.type === "interactive" &&
    message.interactive.type === "button_reply"
      ? message.interactive.button_reply
      : null;

  const listReply =
    message.type === "interactive" && message.interactive.type === "list_reply"
      ? message.interactive.list_reply
      : null;

  const parsedMessage = {
    // Restaurant identification
    phoneNumberId: value.metadata?.phone_number_id ?? null,
    displayPhoneNumber: value.metadata?.display_phone_number ?? null,

    // Customer
    messageId: message.id,
    from: message.from,
    profileName: value.contacts?.[0]?.profile?.name ?? null,

    // Message
    timestamp: Number(message.timestamp),
    type: message.type,

    text: message.type === "text" ? message.text.body : null,

    buttonReply,

    listReply,

    raw: payload,
  };

  // Normalize global command (if any)
  parsedMessage.command = parseCommand(parsedMessage);

  return parsedMessage;
};
