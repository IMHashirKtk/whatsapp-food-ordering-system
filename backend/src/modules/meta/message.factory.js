export const text = (to, body) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "text",
  text: {
    preview_url: false,
    body,
  },
});

export const buttons = (to, body, buttons, header = null, footer = null) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "interactive",
  interactive: {
    type: "button",
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
      buttons,
    },
  },
});

export const list = (
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

export const image = (to, imageUrl, caption = "") => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "image",
  image: {
    link: imageUrl,
    ...(caption && { caption }),
  },
});

export const document = (to, documentUrl, filename) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "document",
  document: {
    link: documentUrl,
    filename,
  },
});

export const location = (to, latitude, longitude, name, address) => ({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to,
  type: "location",
  location: {
    latitude,
    longitude,
    name,
    address,
  },
});
