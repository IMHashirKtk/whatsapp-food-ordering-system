import * as repository from "./item.repository.js";
import AppError from "../../../utils/AppError.js";

export const getAll = () => {
  return repository.getAll();
};

export const getById = async (id) => {
  const item = await repository.getById(id);

  if (!item) {
    throw new AppError("Menu item not found.", 404);
  }

  return item;
};

export const getByCategory = (categoryId) => {
  return repository.getByCategory(categoryId);
};

export const create = async (data) => {
  const items = await repository.getAll();

  const exists = items.find(
    (item) =>
      item.categoryId === data.categoryId &&
      item.name.toLowerCase() === data.name.toLowerCase(),
  );

  if (exists) {
    throw new AppError(
      "A menu item with this name already exists in the selected category.",
      409,
    );
  }

  return repository.create(data);
};

export const update = async (id, data) => {
  const item = await getById(id);

  if (data.name && data.name.toLowerCase() !== item.name.toLowerCase()) {
    const items = await repository.getByCategory(
      data.categoryId ?? item.categoryId,
    );

    const exists = items.find(
      (menuItem) =>
        menuItem.id !== id &&
        menuItem.name.toLowerCase() === data.name.toLowerCase(),
    );

    if (exists) {
      throw new AppError(
        "A menu item with this name already exists in the selected category.",
        409,
      );
    }
  }

  return repository.update(id, data);
};

export const remove = async (id) => {
  await getById(id);

  return repository.remove(id);
};
