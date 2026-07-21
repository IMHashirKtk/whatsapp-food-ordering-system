import * as service from "./item.service.js";
import { successResponse } from "../../../utils/api-response.js";

export const getAll = async (req, res) => {
  const items = await service.getAll();

  return successResponse(res, items);
};

export const getById = async (req, res) => {
  const { id } = req.params;

  const item = await service.getById(id);

  return successResponse(res, item);
};

export const getByCategory = async (req, res) => {
  const { categoryId } = req.params;

  const items = await service.getByCategory(categoryId);

  return successResponse(res, items);
};

export const create = async (req, res) => {
  const { body } = req.validated;

  const item = await service.create(body);

  return successResponse(res, item, "Menu item created successfully.", 201);
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { body } = req.validated;

  const item = await service.update(id, body);

  return successResponse(res, item, "Menu item updated successfully.");
};

export const remove = async (req, res) => {
  const { id } = req.params;

  await service.remove(id);

  return successResponse(res, null, "Menu item deleted successfully.");
};
