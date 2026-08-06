export interface MaskedSecret {
  hasValue: boolean;
  masked: string | null;
}

export interface RestaurantSettingsProfile {
  name: string;
  description: string | null;
  imageUrl: string | null;
  address: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  currency: string;
  taxRate: number;
  deliveryFee: number;
  openingTime: string | null;
  closingTime: string | null;
  isOpen: boolean;
}

export interface OrderConfigSettings {
  freeDeliveryThreshold: number;
  minimumOrderAmount: number;
  estimatedPreparationTime: number;
  orderAcceptanceEnabled: boolean;
  temporaryClosureMessage: string | null;
  orderPrefix: string;
  autoAcceptOrders: boolean;
}

export interface PaymentMethodSettings {
  codEnabled: boolean;
  easypaisaEnabled: boolean;
  easypaisaNumber: string | null;
  jazzcashEnabled: boolean;
  jazzcashNumber: string | null;
  bankTransferEnabled: boolean;
  bankName: string | null;
  bankAccountTitle: string | null;
  bankAccountNumber: string | null;
  paymentInstructions: string | null;
}

export interface ReceiptSettings {
  receiptFooter: string | null;
}

export interface NotificationSettings {
  statusNotificationsEnabled: boolean;
  cancellationNotificationsEnabled: boolean;
}

export interface LocalizationSettings {
  language: string;
  timezone: string;
  currencySymbol: string;
}

export interface AISettings {
  aiEnabled: boolean;
  welcomeMessage: string | null;
  orderConfirmation: string | null;
}

export interface MetaSettings {
  metaPhoneNumberId: string | null;
  metaDisplayPhone: string | null;
  metaBusinessAccountId: string | null;
  metaAccessToken: MaskedSecret;
  metaVerifyToken: MaskedSecret;
  webhookSecret: MaskedSecret;
}

export interface SettingsData {
  restaurant: RestaurantSettingsProfile;
  orderConfig: OrderConfigSettings;
  paymentMethods: PaymentMethodSettings;
  receipt: ReceiptSettings;
  notifications: NotificationSettings;
  localization: LocalizationSettings;
  ai: AISettings;
  meta: MetaSettings;
}

export type ProfileSettingsPayload = {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  currency?: string;
  taxRate?: number;
  deliveryFee?: number;
  openingTime?: string | null;
  closingTime?: string | null;
  isOpen?: boolean;
};

export type OrderConfigPayload = Partial<OrderConfigSettings>;
export type PaymentMethodsPayload = Partial<PaymentMethodSettings>;
export type AvailabilityPayload = Pick<
  RestaurantSettingsProfile,
  "openingTime" | "closingTime" | "isOpen"
> &
  Pick<
    OrderConfigSettings,
    "orderAcceptanceEnabled" | "temporaryClosureMessage"
  >;
export type ReceiptSettingsPayload = Partial<ReceiptSettings>;
export type NotificationSettingsPayload = Partial<NotificationSettings>;
export type LocalizationPayload = Partial<LocalizationSettings>;
export type AISettingsPayload = Partial<AISettings>;

export interface MetaSettingsPayload {
  metaPhoneNumberId?: string | null;
  metaDisplayPhone?: string | null;
  metaBusinessAccountId?: string | null;
  metaAccessToken?: string | null;
  metaVerifyToken?: string | null;
  webhookSecret?: string | null;
}
