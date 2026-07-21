import * as repository from "./option.repository.js";
import AppError from "../../../utils/AppError.js";

export const getAll = () => repository.getAll();

export const getById = async (id) => {
  const option = await repository.getById(id);

  if (!option) {
    throw new AppError("Option not found.", 404);
  }

  return option;
};

export const getByGroup = (optionGroupId) =>
  repository.getByGroup(optionGroupId);

export const create = (data) => repository.create(data);

export const update = async (id, data) => {
  await getById(id);

  return repository.update(id, data);
};

export const remove = async (id) => {
  await getById(id);

  return repository.remove(id);
};
