import * as repository from "./category.repository.js";
import AppError from "../../../utils/AppError.js";

/* ==========================
   Read
========================== */

export const getAll = (restaurantId) => {
  return repository.getAll(restaurantId);
};

export const getById = async (id, restaurantId) => {
  const category = await repository.getById(id, restaurantId);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

/* ==========================
   Create
========================== */

export const create = async (restaurantId, data) => {
  data.name = data.name.trim();

  const exists = await repository.findByName(restaurantId, data.name);

  if (exists) {
    throw new AppError("Category already exists.", 409);
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
  const category = await getById(id, restaurantId);

  if (
    data.name &&
    data.name.trim().toLowerCase() !== category.name.trim().toLowerCase()
  ) {
    const exists = await repository.findByName(restaurantId, data.name.trim());

    if (exists && exists.id !== id) {
      throw new AppError("Category already exists.", 409);
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
