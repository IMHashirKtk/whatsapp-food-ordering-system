import axios from "axios";

const BASE_URL = `https://graph.facebook.com/${process.env.META_API_VERSION}`;

export const sendMessage = async (payload) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/${process.env.META_PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
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
