export const buildTextMessage = (to, body) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "text",
  text: {
    preview_url: false,
    body,
  },
});

export const buildButtonMessage = (to, body, buttons) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "button",
    body: {
      text: body,
    },
    action: {
      buttons,
    },
  },
});

export const buildListMessage = (
  to,
  body,
  buttonText,
  sections,
  header = null,
  footer = null,
) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "list",
    ...(header && {
      header: {
        type: "text",
        text: header,
      },
    }),
    body: {
      text: body,
    },
    ...(footer && {
      footer: {
        text: footer,
      },
    }),
    action: {
      button: buttonText,
      sections,
    },
  },
});
