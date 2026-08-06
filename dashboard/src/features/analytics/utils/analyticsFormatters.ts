import type {
  AnalyticsDatePreset,
  AnalyticsFilterState,
  AnalyticsGroupBy,
} from "../types";

export const DEFAULT_ANALYTICS_TIMEZONE = "Asia/Karachi";

const dateParts = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
};

export const getTodayInTimezone = (timezone: string) => {
  try {
    const parts = dateParts(new Date(), timezone);
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch {
    const parts = dateParts(new Date(), DEFAULT_ANALYTICS_TIMEZONE);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
};

export const addCalendarDays = (dateOnly: string, days: number) => {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

export const getPresetRange = (
  preset: Exclude<AnalyticsDatePreset, "custom">,
  timezone: string,
) => {
  const to = getTodayInTimezone(timezone);
  const days = { today: 1, last7: 7, last30: 30, last90: 90 }[preset];

  return { from: addCalendarDays(to, -(days - 1)), to };
};

export const getSuggestedGroupBy = (
  preset: AnalyticsDatePreset,
  from?: string,
  to?: string,
): AnalyticsGroupBy => {
  if (preset === "today" || preset === "last7" || preset === "last30") {
    return "day";
  }

  if (preset === "last90") {
    return "week";
  }

  if (from && to) {
    const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
    const [toYear, toMonth, toDay] = to.split("-").map(Number);
    const dayCount = Math.round(
      (Date.UTC(toYear, toMonth - 1, toDay) -
        Date.UTC(fromYear, fromMonth - 1, fromDay)) /
        86400000,
    ) + 1;

    if (dayCount > 180) {
      return "month";
    }

    if (dayCount > 31) {
      return "week";
    }
  }

  return "day";
};

export const createDefaultFilterState = (
  timezone: string,
): AnalyticsFilterState => {
  const range = getPresetRange("last30", timezone);

  return {
    preset: "last30",
    ...range,
    groupBy: "day",
  };
};

export const formatPkr = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? Number(value) : 0);

export const formatNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-PK").format(Number.isFinite(value) ? Number(value) : 0);

export const formatPercentage = (ratio: number | null | undefined) =>
  `${((Number.isFinite(ratio) ? Number(ratio) : 0) * 100).toFixed(1)}%`;

export const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

export const formatAnalyticsPeriod = (
  period: string,
  timezone: string,
  groupBy: AnalyticsGroupBy,
) => {
  const [year, month, day] = period.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  // The API period is already a restaurant-local calendar date. Formatting it
  // as UTC preserves that date instead of shifting it across timezone bounds.
  void timezone;

  return new Intl.DateTimeFormat("en-PK", {
    timeZone: "UTC",
    ...(groupBy === "month"
      ? { month: "short", year: "numeric" }
      : { month: "short", day: "numeric" }),
  }).format(date);
};

export const formatHour = (hour: number) => {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 || 12;

  return `${displayHour} ${suffix}`;
};

export const getCustomerDisplayName = (
  name: string | null,
  whatsappId: string,
) => name?.trim() || whatsappId;
