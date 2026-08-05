import { ButtonAction } from "./engine/command.constants.js";

export const PAYMENT_METHODS = Object.freeze({
  EASYPAISA: "EASYPAISA",
  JAZZCASH: "JAZZCASH",
  BANK_TRANSFER: "BANK_TRANSFER",
  COD: "COD",
});

const paymentDefinitions = [
  {
    method: PAYMENT_METHODS.EASYPAISA,
    label: "Easypaisa",
    action: ButtonAction.PAYMENT_EASYPAISA,
    description: "Pay using Easypaisa",
  },
  {
    method: PAYMENT_METHODS.JAZZCASH,
    label: "JazzCash",
    action: ButtonAction.PAYMENT_JAZZCASH,
    description: "Pay using JazzCash",
  },
  {
    method: PAYMENT_METHODS.BANK_TRANSFER,
    label: "Bank Transfer",
    action: ButtonAction.PAYMENT_BANK_TRANSFER,
    description: "Direct bank transfer",
  },
  {
    method: PAYMENT_METHODS.COD,
    label: "Cash on Delivery",
    action: ButtonAction.PAYMENT_COD,
    description: "Pay when delivered",
  },
];

const hasText = (value) =>
  typeof value === "string" && value.trim().length > 0;

const getPaymentSettings = (checkoutSettings) => checkoutSettings?.settings;

const isUsable = (method, checkoutSettings) => {
  const settings = getPaymentSettings(checkoutSettings);

  if (!settings) {
    return false;
  }

  switch (method) {
    case PAYMENT_METHODS.EASYPAISA:
      return settings.easypaisaEnabled && hasText(settings.easypaisaNumber);

    case PAYMENT_METHODS.JAZZCASH:
      return settings.jazzcashEnabled && hasText(settings.jazzcashNumber);

    case PAYMENT_METHODS.BANK_TRANSFER:
      return (
        settings.bankTransferEnabled &&
        hasText(settings.bankName) &&
        hasText(settings.bankAccountTitle) &&
        hasText(settings.bankAccountNumber)
      );

    case PAYMENT_METHODS.COD:
      return settings.codEnabled === true;

    default:
      return false;
  }
};

export const getPaymentMethodLabel = (method) =>
  paymentDefinitions.find((definition) => definition.method === method)
    ?.label ?? method ?? "Unknown payment method";

export const getUsablePaymentMethods = (checkoutSettings) =>
  paymentDefinitions.filter((definition) =>
    isUsable(definition.method, checkoutSettings),
  );

export const validateSelectedPaymentMethod = (method, checkoutSettings) => {
  if (!Object.values(PAYMENT_METHODS).includes(method)) {
    return null;
  }

  if (!isUsable(method, checkoutSettings)) {
    return null;
  }

  return paymentDefinitions.find((definition) => definition.method === method);
};

const getCurrencySymbol = (symbol) =>
  hasText(symbol) ? symbol.trim() : "Rs";

export const formatCurrency = (amount, symbol) => {
  const value = Number(amount);
  const safeAmount = Number.isFinite(value) ? value : 0;

  return `${getCurrencySymbol(symbol)} ${safeAmount.toFixed(2)}`;
};

const getAdditionalInstructions = (settings) =>
  hasText(settings.paymentInstructions)
    ? `\n\nAdditional instructions:\n${settings.paymentInstructions.trim()}`
    : "";

export const buildPaymentMessage = (method, checkoutSettings) => {
  const settings = getPaymentSettings(checkoutSettings);

  if (!settings || !validateSelectedPaymentMethod(method, checkoutSettings)) {
    return null;
  }

  const restaurantName = checkoutSettings.name?.trim() || "the restaurant";
  const additionalInstructions = getAdditionalInstructions(settings);

  switch (method) {
    case PAYMENT_METHODS.EASYPAISA:
      return `💳 *Easypaisa Payment*\n\nAccount Title:\n${restaurantName}\n\nAccount Number:\n${settings.easypaisaNumber.trim()}${additionalInstructions}\n\nPlease send the payment and then tap "I've Paid".`;

    case PAYMENT_METHODS.JAZZCASH:
      return `💳 *JazzCash Payment*\n\nAccount Title:\n${restaurantName}\n\nAccount Number:\n${settings.jazzcashNumber.trim()}${additionalInstructions}\n\nPlease send the payment and then tap "I've Paid".`;

    case PAYMENT_METHODS.BANK_TRANSFER:
      return `🏦 *Bank Transfer*\n\nBank:\n${settings.bankName.trim()}\n\nAccount Title:\n${settings.bankAccountTitle.trim()}\n\nAccount Number / IBAN:\n${settings.bankAccountNumber.trim()}${additionalInstructions}\n\nPlease transfer the payment and then tap "I've Paid".`;

    case PAYMENT_METHODS.COD:
      return `💵 *Cash on Delivery*\n\nYou will pay when your order is delivered.\n\nContinue?`;

    default:
      return null;
  }
};
