import type {
  CustomerOrderStatus,
  CustomerPaymentStatus,
  MonetaryAmount,
} from "../types";

export const formatCustomerCurrency = (value?: MonetaryAmount | null) => {
  if (value === null || value === undefined || value === "") {
    return "PKR 0.00";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(amount);
};

export const formatCustomerDate = (value?: string | null) => {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
  }).format(date);
};

export const formatCustomerDateTime = (value?: string | null) => {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatOrderStatus = (status: CustomerOrderStatus) =>
  status.replace(/_/g, " ").toLowerCase();

export const formatPaymentStatus = (status: CustomerPaymentStatus) =>
  status.replace(/_/g, " ").toLowerCase();

export const formatPaymentMethod = (method: string) =>
  method.replace(/_/g, " ").toLowerCase();
