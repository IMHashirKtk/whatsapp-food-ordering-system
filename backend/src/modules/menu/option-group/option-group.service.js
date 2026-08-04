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

const ensureMenuItemBelongsToRestaurant = async (menuItemId, restaurantId) => {
  const menuItem = await repository.getMenuItemById(menuItemId, restaurantId);

  if (!menuItem) {
    throw new AppError("Menu item not found.", 404);
  }

  return menuItem;
};

const ensureSelectionRules = ({ isRequired, minSelect, maxSelect }) => {
  if (minSelect > maxSelect) {
    throw new AppError(
      "minSelect must be less than or equal to maxSelect.",
      400,
    );
  }

  if (isRequired && minSelect < 1) {
    throw new AppError(
      "Required option groups must allow at least one selection.",
      400,
    );
  }
};

/* ==========================
   Create
========================== */

export const create = async (restaurantId, data) => {
  await ensureMenuItemBelongsToRestaurant(data.menuItemId, restaurantId);
  ensureSelectionRules(data);

  return repository.create(data);
};

/* ==========================
   Update
========================== */

export const update = async (id, restaurantId, data) => {
  const group = await getById(id, restaurantId);

  if (data.menuItemId) {
    await ensureMenuItemBelongsToRestaurant(data.menuItemId, restaurantId);
  }

  ensureSelectionRules({
    isRequired: data.isRequired ?? group.isRequired,
    minSelect: data.minSelect ?? group.minSelect,
    maxSelect: data.maxSelect ?? group.maxSelect,
  });

  return repository.update(id, restaurantId, data);
};

/* ==========================
   Delete
========================== */

export const remove = async (id, restaurantId) => {
  await getById(id, restaurantId);

  return repository.remove(id, restaurantId);
};
