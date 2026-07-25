import * as repository from "./item.repository.js";
import AppError from "../../../utils/AppError.js";

/* ==========================
   Read
========================== */

export const getAll = (restaurantId) => {
  return repository.getAll(restaurantId);
};

export const getById = async (id, restaurantId) => {
  const item = await repository.getById(id, restaurantId);

  if (!item) {
    throw new AppError("Menu item not found.", 404);
  }

  return item;
};

export const getByCategory = (categoryId, restaurantId) => {
  return repository.getByCategory(categoryId, restaurantId);
};

/* ==========================
   Create
========================== */

export const create = async (restaurantId, data) => {
  data.name = data.name.trim();

  const exists = await repository.findByName(
    restaurantId,
    data.categoryId,
    data.name,
  );

  if (exists) {
    throw new AppError(
      "A menu item with this name already exists in the selected category.",
      409,
    );
  }

  return repository.create({
    ...data,
    restaurantId,
  });
};

/* ==========================
   Update
========================== */

export const update = async (id, restaurantId, data) => {
  const item = await getById(id, restaurantId);

  if (
    data.name &&
    data.name.trim().toLowerCase() !== item.name.trim().toLowerCase()
  ) {
    const exists = await repository.findByName(
      restaurantId,
      data.categoryId ?? item.categoryId,
      data.name.trim(),
    );

    if (exists && exists.id !== id) {
      throw new AppError(
        "A menu item with this name already exists in the selected category.",
        409,
      );
    }

    data.name = data.name.trim();
  }

  return repository.update(id, restaurantId, data);
};

/* ==========================
   Delete
========================== */

export const remove = async (id, restaurantId) => {
  await getById(id, restaurantId);

  return repository.remove(id, restaurantId);
};
