import { successResponse } from "../../utils/api-response.js";
import * as service from "./analytics.service.js";

export const getOverview = async (req, res) => {
  const overview = await service.getOverview(
    req.user.restaurantId,
    req.validated.query,
  );

  return successResponse(res, overview);
};

export const getTrends = async (req, res) => {
  const trends = await service.getTrends(
    req.user.restaurantId,
    req.validated.query,
  );

  return successResponse(res, trends);
};

export const getProducts = async (req, res) => {
  const products = await service.getProducts(
    req.user.restaurantId,
    req.validated.query,
  );

  return successResponse(res, products);
};

export const getOperations = async (req, res) => {
  const operations = await service.getOperations(
    req.user.restaurantId,
    req.validated.query,
  );

  return successResponse(res, operations);
};

export const getCustomers = async (req, res) => {
  const customers = await service.getCustomers(
    req.user.restaurantId,
    req.validated.query,
  );

  return successResponse(res, customers);
};
