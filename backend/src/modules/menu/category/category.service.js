import * as repository from "./category.repository.js";
import AppError from "../../../utils/AppError.js";

export const getAll = () => {
  return repository.getAll();
};

export const getById = async (id) => {
  const category = await repository.getById(id);

  if (!category) {
    throw new AppError("Category not found.", 404);
  }

  return category;
};

export const create = async (data) => {
  const categories = await repository.getAll();

  const exists = categories.find(
    (category) => category.name.toLowerCase() === data.name.toLowerCase(),
  );

  if (exists) {
    throw new AppError("Category already exists.", 409);
  }

  return repository.create(data);
};

export const update = async (id, data) => {
  const category = await getById(id);

  if (data.name && data.name.toLowerCase() !== category.name.toLowerCase()) {
    const categories = await repository.getAll();

    const exists = categories.find(
      (item) =>
        item.id !== id && item.name.toLowerCase() === data.name.toLowerCase(),
    );

    if (exists) {
      throw new AppError("Category already exists.", 409);
    }
  }

  return repository.update(id, data);
};

export const remove = async (id) => {
  await getById(id);

  return repository.remove(id);
};
