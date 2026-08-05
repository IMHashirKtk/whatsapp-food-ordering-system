import * as repository from "./settings.repository.js";
import AppError from "../../utils/AppError.js";

const toNumber = (value) => (value === null || value === undefined ? value : Number(value));

const hasValue = (value) =>
  typeof value === "string" && value.trim().length > 0;

const maskSecret = (value) => {
  if (!hasValue(value)) {
    return null;
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length <= 4) {
    return "••••";
  }

  return `••••••${normalizedValue.slice(-4)}`;
};

const maskedValuePrefix = "••••";

const rejectMaskedPlaceholders = (data, fields) => {
  const containsPlaceholder = fields.some(
    (field) =>
      typeof data[field] === "string" &&
      data[field].startsWith(maskedValuePrefix),
  );

  if (containsPlaceholder) {
    throw new AppError(
      "Masked sensitive values cannot be submitted. Omit the field to preserve it or send null to clear it.",
      400,
    );
  }
};

const toDashboardSettings = (record) => {
  if (!record?.settings) {
    throw new AppError("Restaurant settings not found.", 404);
  }

  const { settings, ...restaurant } = record;

  return {
    restaurant: {
      ...restaurant,
      taxRate: toNumber(restaurant.taxRate),
      deliveryFee: toNumber(restaurant.deliveryFee),
    },
    orderConfig: {
      freeDeliveryThreshold: toNumber(settings.freeDeliveryThreshold),
      minimumOrderAmount: toNumber(settings.minimumOrderAmount),
      estimatedPreparationTime: settings.estimatedPreparationTime,
      orderAcceptanceEnabled: settings.orderAcceptanceEnabled,
      temporaryClosureMessage: settings.temporaryClosureMessage,
      orderPrefix: settings.orderPrefix,
      autoAcceptOrders: settings.autoAcceptOrders,
    },
    paymentMethods: {
      codEnabled: settings.codEnabled,
      easypaisaEnabled: settings.easypaisaEnabled,
      easypaisaNumber: maskSecret(settings.easypaisaNumber),
      jazzcashEnabled: settings.jazzcashEnabled,
      jazzcashNumber: maskSecret(settings.jazzcashNumber),
      bankTransferEnabled: settings.bankTransferEnabled,
      bankName: settings.bankName,
      bankAccountTitle: settings.bankAccountTitle,
      bankAccountNumber: maskSecret(settings.bankAccountNumber),
      paymentInstructions: settings.paymentInstructions,
    },
    receipt: {
      receiptFooter: settings.receiptFooter,
    },
    notifications: {
      statusNotificationsEnabled: settings.statusNotificationsEnabled,
      cancellationNotificationsEnabled:
        settings.cancellationNotificationsEnabled,
    },
    localization: {
      language: settings.language,
      timezone: settings.timezone,
      currencySymbol: settings.currencySymbol,
    },
    ai: {
      aiEnabled: settings.aiEnabled,
      welcomeMessage: settings.welcomeMessage,
      orderConfirmation: settings.orderConfirmation,
    },
    meta: {
      metaPhoneNumberId: settings.metaPhoneNumberId,
      metaDisplayPhone: settings.metaDisplayPhone,
      metaBusinessAccountId: settings.metaBusinessAccountId,
      metaAccessToken: {
        hasValue: hasValue(settings.metaAccessToken),
        masked: maskSecret(settings.metaAccessToken),
      },
      metaVerifyToken: {
        hasValue: hasValue(settings.metaVerifyToken),
        masked: maskSecret(settings.metaVerifyToken),
      },
      webhookSecret: {
        hasValue: hasValue(settings.webhookSecret),
        masked: maskSecret(settings.webhookSecret),
      },
    },
  };
};

const toMetaStatus = (settings) => ({
  metaPhoneNumberId: settings.metaPhoneNumberId,
  metaDisplayPhone: settings.metaDisplayPhone,
  metaBusinessAccountId: settings.metaBusinessAccountId,
  metaAccessToken: {
    hasValue: hasValue(settings.metaAccessToken),
    masked: maskSecret(settings.metaAccessToken),
  },
  metaVerifyToken: {
    hasValue: hasValue(settings.metaVerifyToken),
    masked: maskSecret(settings.metaVerifyToken),
  },
  webhookSecret: {
    hasValue: hasValue(settings.webhookSecret),
    masked: maskSecret(settings.webhookSecret),
  },
});

const ensureSettings = async (restaurantId) => {
  await repository.getOrCreate(restaurantId);
};

const removeUndefined = (data) =>
  Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );

const getDashboard = async (restaurantId) => {
  const settings = await repository.getDashboardSettings(restaurantId);
  return toDashboardSettings(settings);
};

export const getSettings = async (restaurantId, role) => {
  await ensureSettings(restaurantId);
  return getDashboard(restaurantId);
};

export const updateProfile = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);
  await repository.updateProfile(restaurantId, removeUndefined(data));
  return getDashboard(restaurantId);
};

export const updateOrderConfig = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);
  await repository.updateOrderConfig(restaurantId, removeUndefined(data));
  return getDashboard(restaurantId);
};

const managerPaymentFields = new Set([
  "codEnabled",
  "easypaisaEnabled",
  "jazzcashEnabled",
  "bankTransferEnabled",
  "paymentInstructions",
]);

const paymentToggleFields = [
  "codEnabled",
  "easypaisaEnabled",
  "jazzcashEnabled",
  "bankTransferEnabled",
];

export const updatePaymentMethods = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);

  rejectMaskedPlaceholders(data, [
    "easypaisaNumber",
    "jazzcashNumber",
    "bankAccountNumber",
  ]);

  if (role === "MANAGER") {
    const containsRestrictedField = Object.keys(data).some(
      (field) => !managerPaymentFields.has(field),
    );

    if (containsRestrictedField) {
      throw new AppError(
        "Managers may only update payment method availability and instructions.",
        403,
      );
    }
  }

  const currentFlags = await repository.getPaymentMethodFlags(restaurantId);
  const nextFlags = {
    ...currentFlags,
    ...Object.fromEntries(
      paymentToggleFields
        .filter((field) => data[field] !== undefined)
        .map((field) => [field, data[field]]),
    ),
  };

  if (!paymentToggleFields.some((field) => nextFlags[field] === true)) {
    throw new AppError("At least one payment method must remain enabled.", 400);
  }

  await repository.updatePaymentMethods(restaurantId, removeUndefined(data));
  return getDashboard(restaurantId);
};

export const updateAvailability = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);

  const { openingTime, closingTime, isOpen, ...settingsData } = data;
  await repository.updateAvailability(
    restaurantId,
    removeUndefined({ openingTime, closingTime, isOpen }),
    removeUndefined(settingsData),
  );

  return getDashboard(restaurantId);
};

export const updateReceipt = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);
  await repository.updateSettingsSection(restaurantId, removeUndefined(data));
  return getDashboard(restaurantId);
};

export const updateNotifications = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);
  await repository.updateSettingsSection(restaurantId, removeUndefined(data));
  return getDashboard(restaurantId);
};

export const updateLocalization = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);
  await repository.updateSettingsSection(restaurantId, removeUndefined(data));
  return getDashboard(restaurantId);
};

export const updateAISettings = async (restaurantId, role, data) => {
  await ensureSettings(restaurantId);
  await repository.updateAISettings(restaurantId, removeUndefined(data));
  return getDashboard(restaurantId);
};

export const updateMetaSettings = async (restaurantId, data) => {
  await ensureSettings(restaurantId);
  await repository.updateMetaSettings(restaurantId, removeUndefined(data));

  const settings = await repository.getMetaSettings(restaurantId);
  return toMetaStatus(settings);
};
