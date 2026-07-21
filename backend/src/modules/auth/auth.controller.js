import * as authService from "./auth.service.js";

import { successResponse } from "../../utils/api-response.js";

export const login = async (req, res) => {
  const { email, password } = req.validated.body;

  const token = await authService.login(email, password);

  return successResponse(res, token, "Login successful.");
};

export const me = async (req, res) => {
  const admin = await authService.getProfile(req.user.id);

  return successResponse(res, admin);
};
