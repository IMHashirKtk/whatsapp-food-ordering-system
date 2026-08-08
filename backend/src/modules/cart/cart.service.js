import * as cartRepository from "./cart.repository.js";
import * as menuService from "../menu/menu.service.js";

export const getCart = async (customerId, restaurantId) => {
  return cartRepository.getOrCreateCart(customerId, restaurantId);
};

export const addItem = async ({
  restaurantId,
  customerId,
  menuItemId,
  quantity,
  selectedOptions = [],
  sourceMessageId = null,
}) => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer.");
  }

  const cart = await cartRepository.getOrCreateCart(customerId, restaurantId);

  const menuItem = await menuService.getProductWithOptions(
    menuItemId,
    restaurantId,
  );

  const basePrice = Number(menuItem.basePrice);

  let optionsTotal = 0;
  const selectedOptionObjects = [];

  for (const optionGroup of menuItem.optionGroups) {
    for (const option of optionGroup.options) {
      if (selectedOptions.includes(option.id)) {
        optionsTotal += Number(option.extraPrice);
        selectedOptionObjects.push(option);
      }
    }
  }

  const totalPrice = (basePrice + optionsTotal) * quantity;

  try {
    await cartRepository.transaction(async (tx) => {
      const cartItem = await cartRepository.addItem(tx, {
        cartId: cart.id,
        menuItemId,
        quantity,
        basePrice,
        totalPrice,
        sourceMessageId,
      });

      for (const option of selectedOptionObjects) {
        await cartRepository.addItemOption(tx, {
          cartItemId: cartItem.id,
          optionId: option.id,
          name: option.name,
          extraPrice: option.extraPrice,
        });
      }
    });
  } catch (error) {
    const target = error?.meta?.target;
    const isSourceMessageConflict =
      error?.code === "P2002" &&
      (Array.isArray(target)
        ? target.includes("sourceMessageId")
        : String(target || "").includes("sourceMessageId"));

    if (!sourceMessageId || !isSourceMessageConflict) {
      throw error;
    }
  }

  return cartRepository.getCart(customerId, restaurantId);
};

export const updateQuantity = async () => {
  throw new Error("Not implemented yet.");
};

export const removeItem = async (itemId, restaurantId) => {
  return cartRepository.removeItem(itemId, restaurantId);
};

export const clearCart = async (customerId, restaurantId) => {
  const cart = await cartRepository.getCart(customerId, restaurantId);

  if (!cart) {
    return;
  }

  await cartRepository.clearCart(cart.id);
};
