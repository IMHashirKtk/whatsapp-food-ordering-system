import * as service from "./option-group.service.js";
import { successResponse } from "../../../utils/api-response.js";

export const getAll = async (req, res) =>
  successResponse(res, await service.getAll());

export const getById = async (req, res) =>
  successResponse(res, await service.getById(req.params.id));

export const getByMenuItem = async (req, res) =>
  successResponse(res, await service.getByMenuItem(req.params.menuItemId));

export const create = async (req, res) =>
  successResponse(
    res,
    await service.create(req.validated.body),
    "Option group created successfully.",
    201,
  );

export const update = async (req, res) =>
  successResponse(
    res,
    await service.update(req.params.id, req.validated.body),
    "Option group updated successfully.",
  );

export const remove = async (req, res) => {
  await service.remove(req.params.id);

  return successResponse(res, null, "Option group deleted successfully.");
};
