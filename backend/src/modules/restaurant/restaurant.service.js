import * as repository from "./restaurant.repository.js";
import AppError from "../../utils/AppError.js";

export const getRestaurantByMetaPhoneNumberId = async (phoneNumberId) => {
  const restaurant = await findRestaurantByMetaPhoneNumberId(phoneNumberId);

  if (!restaurant) {
    throw new AppError(
      "Restaurant not found for this WhatsApp Business number.",
      404,
    );
  }

  return restaurant;
};

export const findRestaurantByMetaPhoneNumberId = (phoneNumberId) => {
  if (typeof phoneNumberId !== "string" || !phoneNumberId.trim()) {
    return null;
  }

  return repository.getByMetaPhoneNumberId(phoneNumberId.trim());
};

export const getRestaurantById = async (id) => {
  const restaurant = await repository.getById(id);

  if (!restaurant) {
    throw new AppError("Restaurant not found.", 404);
  }

  return restaurant;
};
