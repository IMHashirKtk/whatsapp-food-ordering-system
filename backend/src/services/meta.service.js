import axios from "axios";
import env from "../config/env.js";

const BASE_URL = `https://graph.facebook.com/${env.meta.apiVersion}/${env.meta.phoneNumberId}/messages`;

export const sendTextMessage = async (to, body) => {
  try {
    console.log({
      token: env.meta.accessToken?.slice(0, 20) + "...",
      phoneNumberId: env.meta.phoneNumberId,
      apiVersion: env.meta.apiVersion,
    });
    await axios.post(
      BASE_URL,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${env.meta.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`📤 Message sent to ${to}`);
  } catch (error) {
    console.error(
      "Failed to send WhatsApp message:",
      error.response?.data || error.message,
    );
  }
};
