import * as service from "./dashboard.service.js";
import { successResponse } from "../../utils/api-response.js";

export const getDashboard = async (req, res) => {
  const dashboard = await service.getDashboard();

  return successResponse(res, dashboard);
};
