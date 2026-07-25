import * as service from "./item.service.js";
import { successResponse } from "../../../utils/api-response.js";

/* ==========================
   Read
========================== */

export const getAll = async (req, res) => {
  const items = await service.getAll(req.user.restaurantId);

  return successResponse(res, items);
};

export const getById = async (req, res) => {
  const { id } = req.params;

  const item = await service.getById(id, req.user.restaurantId);

  return successResponse(res, item);
};

export const getByCategory = async (req, res) => {
  const { categoryId } = req.params;

  const items = await service.getByCategory(categoryId, req.user.restaurantId);

  return successResponse(res, items);
};

/* ==========================
   Create
========================== */

export const create = async (req, res) => {
  const { body } = req.validated;

  const item = await service.create(req.user.restaurantId, body);

  return successResponse(res, item, "Menu item created successfully.", 201);
};

/* ==========================
   Update
========================== */

export const update = async (req, res) => {
  const { id } = req.params;
  const { body } = req.validated;

  const item = await service.update(id, req.user.restaurantId, body);

  return successResponse(res, item, "Menu item updated successfully.");
};

/* ==========================
   Delete
========================== */

export const remove = async (req, res) => {
  const { id } = req.params;

  await service.remove(id, req.user.restaurantId);

  return successResponse(res, null, "Menu item deleted successfully.");
};
