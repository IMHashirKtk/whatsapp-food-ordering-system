import AppError from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: null,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error.",
    errors: null,
  });
};

export default errorHandler;
