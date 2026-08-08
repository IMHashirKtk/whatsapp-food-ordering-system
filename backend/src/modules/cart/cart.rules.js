import AppError from "../../utils/AppError.js";

export const MAX_CART_QUANTITY = 20;

export const isValidCartQuantity = (quantity) =>
  Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_CART_QUANTITY;

export const parseCartQuantity = (value) => {
  if (typeof value === "string" && !/^\d+$/.test(value.trim())) {
    return null;
  }

  const quantity = typeof value === "number" ? value : Number(value);

  return isValidCartQuantity(quantity) ? quantity : null;
};

export const assertValidCartQuantity = (quantity) => {
  if (!isValidCartQuantity(quantity)) {
    throw new AppError(
      `Quantity must be an integer between 1 and ${MAX_CART_QUANTITY}.`,
      400,
    );
  }

  return quantity;
};
