import * as repository from "./option-group.repository.js";
import AppError from "../../../utils/AppError.js";

export const getAll = () => repository.getAll();

export const getById = async (id) => {
  const group = await repository.getById(id);

  if (!group) {
    throw new AppError("Option group not found.", 404);
  }

  return group;
};

export const getByMenuItem = (menuItemId) =>
  repository.getByMenuItem(menuItemId);

export const create = (data) => repository.create(data);

export const update = async (id, data) => {
  await getById(id);

  return repository.update(id, data);
};

export const remove = async (id) => {
  await getById(id);

  return repository.remove(id);
};
