import * as service from "./dashboard.service.js";
import { successResponse } from "../../utils/api-response.js";

export const getSummary = async (req, res) => {
  const dashboard = await service.getSummary(req.user.restaurantId);

  return successResponse(
    res,
    dashboard,
    "Dashboard summary fetched successfully.",
  );
};
