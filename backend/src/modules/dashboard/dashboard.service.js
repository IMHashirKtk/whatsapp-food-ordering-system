import * as repository from "./dashboard.repository.js";

export const getSummary = async (restaurantId) => {
  return repository.getSummary(restaurantId);
};
