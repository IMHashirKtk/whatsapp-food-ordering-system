import * as service from "./category.service.js";
import { successResponse } from "../../../utils/api-response.js";

export const getAll = async (req, res) => {
  const categories = await service.getAll();

  return successResponse(res, categories);
};

export const getById = async (req, res) => {
  const { id } = req.params;

  const category = await service.getById(id);

  return successResponse(res, category);
};

export const create = async (req, res) => {
  const { body } = req.validated;

  const category = await service.create(body);

  return successResponse(res, category, "Category created successfully.", 201);
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { body } = req.validated;

  const category = await service.update(id, body);

  return successResponse(res, category, "Category updated successfully.");
};

export const remove = async (req, res) => {
  const { id } = req.params;

  await service.remove(id);

  return successResponse(res, null, "Category deleted successfully.");
};
