import * as service from "./option.service.js";
import { successResponse } from "../../../utils/api-response.js";

/* ==========================
   Read
========================== */

export const getAll = async (req, res) => {
  const options = await service.getAll(req.user.restaurantId);

  return successResponse(res, options);
};

export const getById = async (req, res) => {
  const option = await service.getById(req.params.id, req.user.restaurantId);

  return successResponse(res, option);
};

export const getByGroup = async (req, res) => {
  const options = await service.getByGroup(
    req.params.optionGroupId,
    req.user.restaurantId,
  );

  return successResponse(res, options);
};

/* ==========================
   Create
========================== */

export const create = async (req, res) => {
  const option = await service.create(
    req.user.restaurantId,
    req.validated.body,
  );

  return successResponse(res, option, "Option created successfully.", 201);
};

/* ==========================
   Update
========================== */

export const update = async (req, res) => {
  const option = await service.update(
    req.params.id,
    req.user.restaurantId,
    req.validated.body,
  );

  return successResponse(res, option, "Option updated successfully.");
};

/* ==========================
   Delete
========================== */

export const remove = async (req, res) => {
  await service.remove(req.params.id, req.user.restaurantId);

  return successResponse(res, null, "Option deleted successfully.");
};
