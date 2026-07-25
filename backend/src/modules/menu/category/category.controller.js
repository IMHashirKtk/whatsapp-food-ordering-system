import * as service from "./category.service.js";
import { successResponse } from "../../../utils/api-response.js";

/* ==========================
   Read
========================== */

export const getAll = async (req, res) => {
  const categories = await service.getAll(req.user.restaurantId);

  return successResponse(res, categories);
};

export const getById = async (req, res) => {
  const { id } = req.params;

  const category = await service.getById(id, req.user.restaurantId);

  return successResponse(res, category);
};

/* ==========================
   Create
========================== */

export const create = async (req, res) => {
  const { body } = req.validated;

  const category = await service.create(req.user.restaurantId, body);

  return successResponse(res, category, "Category created successfully.", 201);
};

/* ==========================
   Update
========================== */

export const update = async (req, res) => {
  const { id } = req.params;
  const { body } = req.validated;

  const category = await service.update(id, req.user.restaurantId, body);

  return successResponse(res, category, "Category updated successfully.");
};

/* ==========================
   Delete
========================== */

export const remove = async (req, res) => {
  const { id } = req.params;

  await service.remove(id, req.user.restaurantId);

  return successResponse(res, null, "Category deleted successfully.");
};
