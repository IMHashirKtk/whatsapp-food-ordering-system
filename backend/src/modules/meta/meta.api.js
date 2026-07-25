import axios from "axios";

import * as settingsRepository from "../settings/settings.repository.js";

const BASE_URL = `https://graph.facebook.com/${process.env.META_API_VERSION}`;

const getMetaConfig = async (restaurantId) => {
  const settings = await settingsRepository.getByRestaurantId(restaurantId);

  if (!settings) {
    throw new Error("Restaurant settings not found.");
  }

  if (!settings.metaAccessToken) {
    throw new Error("Meta Access Token is not configured.");
  }

  if (!settings.metaPhoneNumberId) {
    throw new Error("Meta Phone Number ID is not configured.");
  }

  return {
    accessToken: settings.metaAccessToken,
    phoneNumberId: settings.metaPhoneNumberId,
  };
};

export const sendMessage = async (restaurantId, payload) => {
  const meta = await getMetaConfig(restaurantId);

  try {
    const response = await axios.post(
      `${BASE_URL}/${meta.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${meta.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("META RESPONSE");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log("META ERROR");

    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    throw error;
  }
};
