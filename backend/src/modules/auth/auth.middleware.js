import jwt from "jsonwebtoken";

import AppError from "../../utils/AppError.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch {
    next(new AppError("Invalid token.", 401));
  }
};
