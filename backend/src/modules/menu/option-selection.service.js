import AppError from "../../utils/AppError.js";

const invalidSelection = (message) => new AppError(message, 400);

export const validateSelectedOptions = (menuItem, selectedOptionIds = []) => {
  if (!Array.isArray(selectedOptionIds)) {
    throw invalidSelection("Invalid menu option selection.");
  }

  if (selectedOptionIds.some((optionId) => typeof optionId !== "string")) {
    throw invalidSelection("Invalid menu option selection.");
  }

  const uniqueOptionIds = new Set(selectedOptionIds);

  if (uniqueOptionIds.size !== selectedOptionIds.length) {
    throw invalidSelection("An option cannot be selected more than once.");
  }

  const optionById = new Map();
  const groupByOptionId = new Map();

  for (const group of menuItem?.optionGroups ?? []) {
    for (const option of group.options ?? []) {
      if (optionById.has(option.id)) {
        throw invalidSelection("Menu option configuration is invalid.");
      }

      optionById.set(option.id, option);
      groupByOptionId.set(option.id, group);
    }
  }

  for (const optionId of selectedOptionIds) {
    const option = optionById.get(optionId);

    if (!option) {
      throw invalidSelection("One or more selected options are invalid.");
    }

    if (option.isAvailable !== true) {
      throw invalidSelection("One or more selected options are no longer available.");
    }
  }

  for (const group of menuItem?.optionGroups ?? []) {
    const selectedCount = selectedOptionIds.filter(
      (optionId) => groupByOptionId.get(optionId)?.id === group.id,
    ).length;
    const minimum = Number(group.minSelect ?? 0);
    const maximum = Number(group.maxSelect ?? 0);

    if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum > maximum) {
      throw invalidSelection("Menu option configuration is invalid.");
    }

    const requiredMinimum = group.isRequired ? Math.max(1, minimum) : minimum;

    if (selectedCount < requiredMinimum || selectedCount > maximum) {
      throw invalidSelection("Please select the required menu options.");
    }
  }

  return {
    selectedOptions: selectedOptionIds.map((optionId) => optionById.get(optionId)),
    optionsTotal: selectedOptionIds.reduce(
      (total, optionId) => total + Number(optionById.get(optionId).extraPrice),
      0,
    ),
  };
};
