import * as service from "./option.service.js";
import { successResponse } from "../../../utils/api-response.js";

export const getAll = async (req, res) =>
  successResponse(res, await service.getAll());

export const getById = async (req, res) =>
  successResponse(res, await service.getById(req.params.id));

export const getByGroup = async (req, res) =>
  successResponse(res, await service.getByGroup(req.params.optionGroupId));

export const create = async (req, res) =>
  successResponse(
    res,
    await service.create(req.validated.body),
    "Option created successfully.",
    201,
  );

export const update = async (req, res) =>
  successResponse(
    res,
    await service.update(req.params.id, req.validated.body),
    "Option updated successfully.",
  );

export const remove = async (req, res) => {
  await service.remove(req.params.id);

  return successResponse(res, null, "Option deleted successfully.");
};
