import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as authRepository from "./auth.repository.js";

import AppError from "../../utils/AppError.js";

export const login = async (email, password) => {
  const user = await authRepository.getByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive.", 403);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new AppError("Invalid email or password.", 401);
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
  };
};

export const getProfile = async (id) => {
  return authRepository.getById(id);
};
