/* ==========================
   Get Settings
========================== */

export const getSettings = async (restaurantId) => {
  return repository.getOrCreate(restaurantId);
};

/* ==========================
   General Settings
========================== */

export const updateSettings = async (restaurantId, data) => {
  await repository.getOrCreate(restaurantId);

  return repository.update(restaurantId, data);
};

/* ==========================
   Meta Settings
========================== */

export const updateMetaSettings = async (restaurantId, data) => {
  await repository.getOrCreate(restaurantId);

  return repository.updateMetaSettings(restaurantId, data);
};

/* ==========================
   AI Settings
========================== */

export const updateAISettings = async (restaurantId, data) => {
  await repository.getOrCreate(restaurantId);

  return repository.updateAISettings(restaurantId, data);
};
