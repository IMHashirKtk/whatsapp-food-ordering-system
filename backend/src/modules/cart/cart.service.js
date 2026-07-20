import * as cartRepository from "./cart.repository.js";
import * as menuService from "../menu/menu.service.js";

/**
 * Create cart if it doesn't exist
 */
export const getCart = async (customerId) => {
  return cartRepository.getOrCreateCart(customerId);
};

/**
 * Add item to cart
 */
export const addItem = async ({
  customerId,
  menuItemId,
  quantity,
  selectedOptions = [],
}) => {
  const cart = await cartRepository.getOrCreateCart(customerId);

  const menu = await menuService.getMenuTree();

  let menuItem = null;

  for (const category of menu) {
    const found = category.menuItems.find((item) => item.id === menuItemId);

    if (found) {
      menuItem = found;
      break;
    }
  }

  if (!menuItem) {
    throw new Error("Menu item not found.");
  }

  let basePrice = Number(menuItem.basePrice);
  let optionsTotal = 0;

  const selectedOptionObjects = [];

  for (const optionId of selectedOptions) {
    for (const group of menuItem.optionGroups) {
      const option = group.options.find((o) => o.id === optionId);

      if (option) {
        optionsTotal += Number(option.extraPrice);

        selectedOptionObjects.push(option);
      }
    }
  }

  const singleItemPrice = basePrice + optionsTotal;
  const totalPrice = singleItemPrice * quantity;

  const cartItem = await cartRepository.addItem({
    cartId: cart.id,
    menuItemId,
    quantity,
    basePrice,
    totalPrice,
  });

  for (const option of selectedOptionObjects) {
    await cartRepository.addItemOption({
      cartItemId: cartItem.id,
      optionId: option.id,
      name: option.name,
      extraPrice: option.extraPrice,
    });
  }

  return cartRepository.getCart(customerId);
};

/**
 * Update quantity
 */
export const updateQuantity = async (itemId, quantity) => {
  throw new Error("Not implemented yet.");
};

/**
 * Remove item
 */
export const removeItem = async (itemId) => {
  return cartRepository.removeItem(itemId);
};

/**
 * Empty cart
 */
export const clearCart = async (customerId) => {
  const cart = await cartRepository.getCart(customerId);

  if (!cart) {
    return;
  }

  await cartRepository.clearCart(cart.id);
};
