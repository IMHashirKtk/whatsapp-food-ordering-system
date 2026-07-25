import * as repository from "./option.repository.js";
import AppError from "../../../utils/AppError.js";

/* ==========================
   Read
========================== */

export const getAll = (restaurantId) => {
  return repository.getAll(restaurantId);
};

export const getById = async (id, restaurantId) => {
  const option = await repository.getById(id, restaurantId);

  if (!option) {
    throw new AppError("Option not found.", 404);
  }

  return option;
};

export const getByGroup = (optionGroupId, restaurantId) => {
  return repository.getByGroup(optionGroupId, restaurantId);
};

/* ==========================
   Create
========================== */

export const create = async (restaurantId, data) => {
  const groups = await repository.getByGroup(data.optionGroupId, restaurantId);

  if (!groups.length) {
    throw new AppError("Option group not found.", 404);
  }

  return repository.create(data);
};

/* ==========================
   Update
========================== */

export const update = async (id, restaurantId, data) => {
  await getById(id, restaurantId);

  return repository.update(id, restaurantId, data);
};

/* ==========================
   Delete
========================== */

export const remove = async (id, restaurantId) => {
  await getById(id, restaurantId);

  return repository.remove(id, restaurantId);
};
