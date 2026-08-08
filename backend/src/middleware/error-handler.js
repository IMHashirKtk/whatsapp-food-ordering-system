import AppError from "../utils/AppError.js";

const sanitizeMessage = (message) =>
  String(message || "Internal server error.")
    .replace(/Bearer\s+[^\s]+/gi, "Bearer [REDACTED]")
    .replace(/([?&](?:access_token|token|secret|password)=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(token|secret|password|authorization)\s*[:=]\s*[^,\s]+/gi, "$1=[REDACTED]")
    .slice(0, 300);

const getSafeErrorDetails = (error, req) => ({
  name: error?.name || "Error",
  message: sanitizeMessage(error?.message),
  status: error?.statusCode || 500,
  ...(typeof error?.code === "string" && { code: error.code.slice(0, 80) }),
  method: req.method,
  path: req.path || "/",
});

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: null,
    });
  }

  console.error("[API Error]", getSafeErrorDetails(err, req));

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
    errors: null,
  });
};

export default errorHandler;
