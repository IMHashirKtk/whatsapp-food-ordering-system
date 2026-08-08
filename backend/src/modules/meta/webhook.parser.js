import { parseCommand } from "./command.parser.js";

const supportedMessageTypes = new Set([
  "text",
  "image",
  "audio",
  "video",
  "document",
  "location",
  "contacts",
  "contact",
  "sticker",
  "reaction",
  "interactive",
]);

const getChangeValues = (payload) =>
  (Array.isArray(payload?.entry) ? payload.entry : []).flatMap((entry) =>
    Array.isArray(entry?.changes)
      ? entry.changes
          .map((change) => change?.value)
          .filter((value) => value && typeof value === "object")
      : [],
  );

const normalizeMessageType = (type) => {
  if (typeof type !== "string") {
    return "UNKNOWN";
  }

  const normalizedType = type.toLowerCase();

  if (!supportedMessageTypes.has(normalizedType)) {
    return "UNKNOWN";
  }

  if (normalizedType === "contacts") {
    return "CONTACT";
  }

  if (normalizedType === "interactive") {
    return "INTERACTIVE";
  }

  return normalizedType.toUpperCase();
};

const normalizeInteractiveReply = (reply) => {
  if (
    !reply ||
    typeof reply !== "object" ||
    typeof reply.id !== "string" ||
    !reply.id.trim()
  ) {
    return null;
  }

  return reply;
};

const parseMessage = (value, message) => {
  if (
    !message ||
    typeof message.id !== "string" ||
    !message.id.trim() ||
    typeof message.from !== "string" ||
    !message.from.trim() ||
    typeof message.type !== "string"
  ) {
    return null;
  }

  const interactive = message.type === "interactive" ? message.interactive : null;
  const buttonReply =
    interactive?.type === "button_reply"
      ? normalizeInteractiveReply(interactive.button_reply)
      : null;
  const listReply =
    interactive?.type === "list_reply"
      ? normalizeInteractiveReply(interactive.list_reply)
      : null;
  const timestamp = Number(message.timestamp);

  const parsedMessage = {
    phoneNumberId: value?.metadata?.phone_number_id ?? null,
    displayPhoneNumber: value?.metadata?.display_phone_number ?? null,
    messageId: message.id,
    from: message.from,
    profileName:
      typeof value?.contacts?.[0]?.profile?.name === "string"
        ? value.contacts[0].profile.name
        : null,
    timestamp: Number.isFinite(timestamp) ? timestamp : null,
    type: message.type,
    messageType: normalizeMessageType(message.type),
    text:
      message.type === "text" && typeof message.text?.body === "string"
        ? message.text.body
        : null,
    buttonReply,
    listReply,
  };

  parsedMessage.command = parseCommand(parsedMessage);

  return parsedMessage;
};

export const getWebhookPhoneNumberIds = (payload) =>
  getChangeValues(payload).map(
    (value) => value.metadata?.phone_number_id ?? null,
  );

export const parseWebhooks = (payload) =>
  getChangeValues(payload).flatMap((value) =>
    Array.isArray(value.messages)
      ? value.messages
          .map((message) => parseMessage(value, message))
          .filter(Boolean)
      : [],
  );

// Kept for compatibility with existing callers that expect one message.
export const parseWebhook = (payload) => parseWebhooks(payload)[0] ?? null;

export { normalizeMessageType };
