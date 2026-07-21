import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as authRepository from "./auth.repository.js";

import AppError from "../../utils/AppError.js";

export const login = async (email, password) => {
  const admin = await authRepository.getByEmail(email);

  if (!admin) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!admin.isActive) {
    throw new AppError("Account is inactive.", 403);
  }

  const validPassword = await bcrypt.compare(password, admin.password);

  if (!validPassword) {
    throw new AppError("Invalid email or password.", 401);
  }

  const accessToken = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return {
    accessToken,
  };
};

export const getProfile = async (id) => {
  return authRepository.getById(id);
};
