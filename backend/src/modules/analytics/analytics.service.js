import AppError from "../../utils/AppError.js";
import * as repository from "./analytics.repository.js";

const DEFAULT_RANGE_DAYS = 30;
const MAX_RANGE_DAYS = 366;
const DATE_PART_FORMATTER_CACHE = new Map();

const getDatePartFormatter = (timezone) => {
  if (!DATE_PART_FORMATTER_CACHE.has(timezone)) {
    DATE_PART_FORMATTER_CACHE.set(
      timezone,
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    );
  }

  return DATE_PART_FORMATTER_CACHE.get(timezone);
};

const parseDateOnly = (value) => {
  const [year, month, day] = value.split("-").map(Number);

  return { year, month, day };
};

const dateOnlyToUtcTime = (value) => {
  const { year, month, day } = parseDateOnly(value);

  return Date.UTC(year, month - 1, day);
};

const formatDateOnlyFromUtcTime = (time) => {
  const date = new Date(time);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addCalendarDays = (value, days) =>
  formatDateOnlyFromUtcTime(dateOnlyToUtcTime(value) + days * 86400000);

const diffCalendarDays = (from, to) =>
  Math.round((dateOnlyToUtcTime(to) - dateOnlyToUtcTime(from)) / 86400000);

const getTodayInTimezone = (timezone) => {
  const parts = getDatePartFormatter(timezone).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const getTimeZoneOffsetMs = (date, timezone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return asUtc - date.getTime();
};

const localDateStartToUtc = (dateOnly, timezone) => {
  const { year, month, day } = parseDateOnly(dateOnly);
  const localAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  const firstPass = new Date(
    localAsUtc - getTimeZoneOffsetMs(new Date(localAsUtc), timezone),
  );

  return new Date(localAsUtc - getTimeZoneOffsetMs(firstPass, timezone));
};

const assertValidTimezone = (timezone) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
  } catch {
    throw new AppError("Restaurant timezone is invalid.", 400);
  }
};

export const resolveDateRangeForTimezone = (timezone, query) => {
  assertValidTimezone(timezone);

  const today = getTodayInTimezone(timezone);
  const from =
    query.from ??
    (query.to
      ? addCalendarDays(query.to, -(DEFAULT_RANGE_DAYS - 1))
      : addCalendarDays(today, -(DEFAULT_RANGE_DAYS - 1)));
  const to = query.to ?? today;
  const rangeDays = diffCalendarDays(from, to) + 1;

  if (rangeDays < 1) {
    throw new AppError("Invalid analytics date range.", 400);
  }

  if (rangeDays > MAX_RANGE_DAYS) {
    throw new AppError(
      `Analytics date range cannot exceed ${MAX_RANGE_DAYS} days.`,
      400,
    );
  }

  return {
    from,
    to,
    timezone,
    startUtc: localDateStartToUtc(from, timezone),
    endUtc: localDateStartToUtc(addCalendarDays(to, 1), timezone),
  };
};

export const resolveDateRange = async (restaurantId, query) => {
  const timezone = await repository.getRestaurantTimezone(restaurantId);

  return resolveDateRangeForTimezone(timezone, query);
};

const calculateRatio = (numerator, denominator) => {
  if (denominator === 0) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(4));
};

const calculateAverage = (total, count) => {
  if (count === 0) {
    return 0;
  }

  return Number((total / count).toFixed(2));
};

const normalizeDistribution = (groups, field) =>
  groups.map((group) => ({
    [field]: group[field],
    orders: group._count._all,
  }));

export const getOverview = async (restaurantId, query) => {
  const range = await resolveDateRange(restaurantId, query);

  const [orderSummary, customerSummary] = await Promise.all([
    repository.getOverviewOrderSummary({
      restaurantId,
      ...range,
    }),
    repository.getCustomerRangeClassification({
      restaurantId,
      ...range,
    }),
  ]);

  return {
    orders: orderSummary.orders,
    cancelledOrders: orderSummary.cancelledOrders,
    cancellationRate: calculateRatio(
      orderSummary.cancelledOrders,
      orderSummary.orders,
    ),
    grossOrderValue: orderSummary.grossOrderValue,
    recognizedRevenue: orderSummary.recognizedRevenue,
    averageOrderValue: calculateAverage(
      orderSummary.grossOrderValue,
      orderSummary.nonCancelledOrders,
    ),
    newCustomers: customerSummary.newCustomers,
    returningCustomers: customerSummary.returningCustomers,
  };
};

export const getTrends = async (restaurantId, query) => {
  const range = await resolveDateRange(restaurantId, query);
  const buckets = await repository.getTrendBuckets({
    restaurantId,
    ...range,
    groupBy: query.groupBy,
  });

  return buckets.map(({ nonCancelledOrders, ...bucket }) => ({
    ...bucket,
    averageOrderValue: calculateAverage(
      bucket.grossOrderValue,
      nonCancelledOrders,
    ),
  }));
};

export const getProducts = async (restaurantId, query) => {
  const range = await resolveDateRange(restaurantId, query);

  return repository.getProductAnalytics({
    restaurantId,
    ...range,
    limit: query.limit,
    categoryId: query.categoryId,
  });
};

export const getOperations = async (restaurantId, query) => {
  const range = await resolveDateRange(restaurantId, query);
  const operations = await repository.getOperationsAnalytics({
    restaurantId,
    ...range,
  });

  return {
    orderStatusDistribution: normalizeDistribution(
      operations.orderStatusDistribution,
      "status",
    ),
    paymentMethodDistribution: normalizeDistribution(
      operations.paymentMethodDistribution,
      "paymentMethod",
    ),
    paymentStatusDistribution: normalizeDistribution(
      operations.paymentStatusDistribution,
      "paymentStatus",
    ),
    peakOrderingHours: operations.peakOrderingHours.map((hour) => ({
      hour: Number(hour.hour),
      orders: Number(hour.orders),
    })),
  };
};

export const getCustomers = async (restaurantId, query) => {
  const range = await resolveDateRange(restaurantId, query);

  return repository.getCustomerAnalytics({
    restaurantId,
    ...range,
    limit: query.limit,
  });
};
