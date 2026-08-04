import "dotenv/config";

const configuredDashboardOrigin = process.env.DASHBOARD_ORIGIN?.trim();

const dashboardOrigin = configuredDashboardOrigin
  ? new URL(configuredDashboardOrigin).origin
  : null;

const allowLocalDevelopmentOrigin =
  process.env.NODE_ENV === "development" ||
  (!configuredDashboardOrigin && process.env.NODE_ENV !== "production");

const allowedOrigins = new Set([
  ...(dashboardOrigin ? [dashboardOrigin] : []),
  ...(allowLocalDevelopmentOrigin ? ["http://localhost:3000"] : []),
]);

const isAllowedOrigin = (origin) => !origin || allowedOrigins.has(origin);

const corsOrigin = (origin, callback) => {
  if (isAllowedOrigin(origin)) {
    return callback(null, true);
  }

  return callback(new Error("Origin is not allowed."));
};

const env = {
  port: process.env.PORT || 5000,
  dashboardOrigin,
  corsOrigin,

  databaseUrl: process.env.DATABASE_URL,

  meta: {
    accessToken: process.env.META_ACCESS_TOKEN,
    phoneNumberId: process.env.META_PHONE_NUMBER_ID,
    verifyToken: process.env.META_VERIFY_TOKEN,
    apiVersion: process.env.META_API_VERSION || "v23.0",
  },
};

export default env;
