import * as service from "./option-group.service.js";
import { successResponse } from "../../../utils/api-response.js";

/* ==========================
   Read
========================== */

export const getAll = async (req, res) => {
  const groups = await service.getAll(req.user.restaurantId);

  return successResponse(res, groups);
};

export const getById = async (req, res) => {
  const group = await service.getById(req.params.id, req.user.restaurantId);

  return successResponse(res, group);
};

export const getByMenuItem = async (req, res) => {
  const groups = await service.getByMenuItem(
    req.params.menuItemId,
    req.user.restaurantId,
  );

  return successResponse(res, groups);
};

/* ==========================
   Create
========================== */

export const create = async (req, res) => {
  const group = await service.create(req.user.restaurantId, req.validated.body);

  return successResponse(res, group, "Option group created successfully.", 201);
};

/* ==========================
   Update
========================== */

export const update = async (req, res) => {
  const group = await service.update(
    req.params.id,
    req.user.restaurantId,
    req.validated.body,
  );

  return successResponse(res, group, "Option group updated successfully.");
};

/* ==========================
   Delete
========================== */

export const remove = async (req, res) => {
  await service.remove(req.params.id, req.user.restaurantId);

  return successResponse(res, null, "Option group deleted successfully.");
};
