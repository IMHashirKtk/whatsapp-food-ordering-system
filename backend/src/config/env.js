import "dotenv/config";

const env = {
  port: process.env.PORT || 5000,

  databaseUrl: process.env.DATABASE_URL,

  meta: {
    accessToken: process.env.META_ACCESS_TOKEN,
    phoneNumberId: process.env.META_PHONE_NUMBER_ID,
    verifyToken: process.env.META_VERIFY_TOKEN,
    apiVersion: process.env.META_API_VERSION || "v23.0",
  },
};

export default env;
