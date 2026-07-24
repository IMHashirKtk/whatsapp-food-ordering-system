import * as authService from "./auth.service.js";

import { successResponse } from "../../utils/api-response.js";

export const login = async (req, res) => {
  const { email, password } = req.validated.body;

  const data = await authService.login(email, password);

  return successResponse(res, data, "Login successful.");
};

export const me = async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  return successResponse(res, user);
};
