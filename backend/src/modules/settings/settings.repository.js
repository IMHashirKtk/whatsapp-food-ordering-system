import prisma from "../../database/prisma.js";

const dashboardRestaurantSelect = {
  name: true,
  description: true,
  imageUrl: true,
  address: true,
  phone: true,
  whatsappNumber: true,
  email: true,
  currency: true,
  taxRate: true,
  deliveryFee: true,
  openingTime: true,
  closingTime: true,
  isOpen: true,
  settings: {
    select: {
      freeDeliveryThreshold: true,
      minimumOrderAmount: true,
      estimatedPreparationTime: true,
      orderAcceptanceEnabled: true,
      temporaryClosureMessage: true,
      orderPrefix: true,
      autoAcceptOrders: true,
      codEnabled: true,
      easypaisaEnabled: true,
      easypaisaNumber: true,
      jazzcashEnabled: true,
      jazzcashNumber: true,
      bankTransferEnabled: true,
      bankName: true,
      bankAccountTitle: true,
      bankAccountNumber: true,
      paymentInstructions: true,
      receiptFooter: true,
      statusNotificationsEnabled: true,
      cancellationNotificationsEnabled: true,
      language: true,
      timezone: true,
      currencySymbol: true,
      aiEnabled: true,
      welcomeMessage: true,
      orderConfirmation: true,
      metaPhoneNumberId: true,
      metaDisplayPhone: true,
      metaBusinessAccountId: true,
      metaAccessToken: true,
      metaVerifyToken: true,
      webhookSecret: true,
    },
  },
};

const checkoutRestaurantSelect = {
  name: true,
  currency: true,
  taxRate: true,
  deliveryFee: true,
  isOpen: true,
  settings: {
    select: {
      codEnabled: true,
      easypaisaEnabled: true,
      easypaisaNumber: true,
      jazzcashEnabled: true,
      jazzcashNumber: true,
      bankTransferEnabled: true,
      bankName: true,
      bankAccountTitle: true,
      bankAccountNumber: true,
      paymentInstructions: true,
      currencySymbol: true,
      minimumOrderAmount: true,
      freeDeliveryThreshold: true,
      orderAcceptanceEnabled: true,
      estimatedPreparationTime: true,
      orderPrefix: true,
    },
  },
};

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
  return prisma.restaurantSettings.upsert({
    where: { restaurantId },
    update: {},
    create: { restaurantId },
  });
};

export const getPaymentMethodFlags = (restaurantId) => {
  return prisma.restaurantSettings.findUnique({
    where: { restaurantId },
    select: {
      codEnabled: true,
      easypaisaEnabled: true,
      jazzcashEnabled: true,
      bankTransferEnabled: true,
    },
  });
};

export const getDashboardSettings = (restaurantId) => {
  return prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: dashboardRestaurantSelect,
  });
};

export const getCheckoutSettings = (restaurantId) => {
  return prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: checkoutRestaurantSelect,
  });
};

export const getMetaSettings = (restaurantId) => {
  return prisma.restaurantSettings.findUnique({
    where: { restaurantId },
    select: {
      metaPhoneNumberId: true,
      metaDisplayPhone: true,
      metaBusinessAccountId: true,
      metaAccessToken: true,
      metaVerifyToken: true,
      webhookSecret: true,
    },
  });
};

export const updateProfile = (restaurantId, data) => {
  return prisma.restaurant.update({
    where: { id: restaurantId },
    data,
  });
};

export const updateOrderConfig = (restaurantId, data) => {
  return prisma.restaurantSettings.update({
    where: { restaurantId },
    data,
  });
};

export const updatePaymentMethods = (restaurantId, data) => {
  return prisma.restaurantSettings.update({
    where: { restaurantId },
    data,
  });
};

export const updateAvailability = async (restaurantId, restaurantData, settingsData) => {
  return prisma.$transaction([
    prisma.restaurant.update({
      where: { id: restaurantId },
      data: restaurantData,
    }),
    prisma.restaurantSettings.update({
      where: { restaurantId },
      data: settingsData,
    }),
  ]);
};

export const updateSettingsSection = (restaurantId, data) => {
  return prisma.restaurantSettings.update({
    where: { restaurantId },
    data,
  });
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
    data,
  });
};

export const updateAISettings = (restaurantId, data) => {
  return prisma.restaurantSettings.update({
    where: {
      restaurantId,
    },
    data,
  });
};
