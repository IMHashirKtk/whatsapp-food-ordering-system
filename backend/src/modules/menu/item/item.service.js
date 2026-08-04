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

const ensureCategoryBelongsToRestaurant = async (categoryId, restaurantId) => {
  const category = await repository.getCategoryById(categoryId, restaurantId);

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

  await ensureCategoryBelongsToRestaurant(data.categoryId, restaurantId);

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

  if (data.categoryId) {
    await ensureCategoryBelongsToRestaurant(data.categoryId, restaurantId);
  }

  const nextName = data.name ? data.name.trim() : item.name;
  const nextCategoryId = data.categoryId ?? item.categoryId;
  const nameChanged = nextName.toLowerCase() !== item.name.trim().toLowerCase();
  const categoryChanged = nextCategoryId !== item.categoryId;

  if (nameChanged || categoryChanged) {
    const exists = await repository.findByName(
      restaurantId,
      nextCategoryId,
      nextName,
    );

    if (exists && exists.id !== id) {
      throw new AppError(
        "A menu item with this name already exists in the selected category.",
        409,
      );
    }
  }

  if (data.name) {
    data.name = nextName;
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
