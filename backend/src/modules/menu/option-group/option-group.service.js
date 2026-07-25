import * as repository from "./option-group.repository.js";
import AppError from "../../../utils/AppError.js";

/* ==========================
   Read
========================== */

export const getAll = (restaurantId) => {
  return repository.getAll(restaurantId);
};

export const getById = async (id, restaurantId) => {
  const group = await repository.getById(id, restaurantId);

  if (!group) {
    throw new AppError("Option group not found.", 404);
  }

  return group;
};

export const getByMenuItem = (menuItemId, restaurantId) => {
  return repository.getByMenuItem(menuItemId, restaurantId);
};

/* ==========================
   Create
========================== */

export const create = async (restaurantId, data) => {
  const menuItem = await repository.getByMenuItem(
    data.menuItemId,
    restaurantId,
  );

  if (!menuItem.length) {
    throw new AppError("Menu item not found.", 404);
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
