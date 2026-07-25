import prisma from "../../database/prisma.js";

/* ==========================
   Settings
========================== */

export const getByRestaurantId = (restaurantId) => {
  return prisma.restaurantSettings.findUnique({
    where: {
      restaurantId,
    },
  });
};

export const create = (restaurantId) => {
  return prisma.restaurantSettings.create({
    data: {
      restaurantId,
    },
  });
};

export const getOrCreate = async (restaurantId) => {
  let settings = await getByRestaurantId(restaurantId);

  if (!settings) {
    settings = await create(restaurantId);
  }

  return settings;
};

export const update = (restaurantId, data) => {
  return prisma.restaurantSettings.update({
    where: {
      restaurantId,
    },
    data,
  });
};

export const updateMetaSettings = (restaurantId, data) => {
  return prisma.restaurantSettings.update({
    where: {
      restaurantId,
    },
    data: {
      metaPhoneNumberId: data.metaPhoneNumberId,
      metaDisplayPhone: data.metaDisplayPhone,
      metaBusinessAccountId: data.metaBusinessAccountId,
      metaAccessToken: data.metaAccessToken,
      metaVerifyToken: data.metaVerifyToken,
      webhookSecret: data.webhookSecret,
    },
  });
};

export const updateAISettings = (restaurantId, data) => {
  return prisma.restaurantSettings.update({
    where: {
      restaurantId,
    },
    data: {
      aiEnabled: data.aiEnabled,
      welcomeMessage: data.welcomeMessage,
      orderConfirmation: data.orderConfirmation,
    },
  });
};
