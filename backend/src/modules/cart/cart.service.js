import * as cartRepository from "./cart.repository.js";
import * as menuService from "../menu/menu.service.js";

export const getCart = async (customerId) => {
  return cartRepository.getOrCreateCart(customerId);
};

export const addItem = async ({
  customerId,
  menuItemId,
  quantity,
  selectedOptions = [],
}) => {
  const cart = await cartRepository.getOrCreateCart(customerId);

  const menuItem = await menuService.getProductWithOptions(menuItemId);

  if (!menuItem) {
    throw new Error("Menu item not found.");
  }

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

  await cartRepository.transaction(async (tx) => {
    const cartItem = await cartRepository.addItem(tx, {
      cartId: cart.id,
      menuItemId,
      quantity,
      basePrice,
      totalPrice,
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

  return cartRepository.getCart(customerId);
};

export const updateQuantity = async () => {
  throw new Error("Not implemented yet.");
};

export const removeItem = async (itemId) => {
  return cartRepository.removeItem(itemId);
};

export const clearCart = async (customerId) => {
  const cart = await cartRepository.getCart(customerId);

  if (!cart) {
    return;
  }

  await cartRepository.clearCart(cart.id);
};
