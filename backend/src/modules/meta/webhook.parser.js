export const parseWebhook = (payload) => {
  const entry = payload?.entry?.[0];

  if (!entry) return null;

  const change = entry.changes?.[0];

  if (!change) return null;

  const value = change.value;

  const message = value?.messages?.[0];

  if (!message) return null;

  return {
    messageId: message.id,
    from: message.from,
    timestamp: Number(message.timestamp),
    type: message.type,
    profileName: value.contacts?.[0]?.profile?.name ?? null,
    text: message.type === "text" ? message.text.body : null,
    buttonReply:
      message.type === "interactive" &&
      message.interactive.type === "button_reply"
        ? message.interactive.button_reply
        : null,
    listReply:
      message.type === "interactive" &&
      message.interactive.type === "list_reply"
        ? message.interactive.list_reply
        : null,
    raw: payload,
  };
};
