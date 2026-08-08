import * as cartRepository from "./cart.repository.js";
import * as menuService from "../menu/menu.service.js";
import { assertValidCartQuantity } from "./cart.rules.js";
import { validateSelectedOptions } from "../menu/option-selection.service.js";
import AppError from "../../utils/AppError.js";

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
  assertValidCartQuantity(quantity);

  const menuItem = await menuService.getProductWithOptions(
    menuItemId,
    restaurantId,
  );

  const basePrice = Number(menuItem.basePrice);
  const { optionsTotal, selectedOptions: selectedOptionObjects } =
    validateSelectedOptions(menuItem, selectedOptions);

  const cart = await cartRepository.getOrCreateCart(customerId, restaurantId);

  if (!cart) {
    throw new AppError("Cart not found.", 404);
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

export const updateQuantity = async (itemId, quantity, restaurantId) => {
  assertValidCartQuantity(quantity);

  const item = await cartRepository.getCartItem(itemId, restaurantId);

  if (!item) {
    throw new AppError("Cart item not found.", 404);
  }

  const unitPrice =
    Number(item.basePrice) +
    item.options.reduce((total, option) => total + Number(option.extraPrice), 0);
  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  return cartRepository.updateQuantity(
    itemId,
    quantity,
    totalPrice,
    restaurantId,
  );
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
