import { z } from "zod";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateOnly = (value) => {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const optionalDate = z
  .string()
  .trim()
  .refine(isValidDateOnly, {
    message: "Date must use YYYY-MM-DD format.",
  })
  .optional();

const dateRangeQuery = {
  from: optionalDate,
  to: optionalDate,
};

export const overviewSchema = z.object({
  query: z.object(dateRangeQuery),
});

export const trendsSchema = z.object({
  query: z.object({
    ...dateRangeQuery,
    groupBy: z.enum(["day", "week", "month"]).default("day"),
  }),
});

export const productsSchema = z.object({
  query: z.object({
    ...dateRangeQuery,
    limit: z.coerce.number().int().min(1).max(50).default(10),
    categoryId: z.string().cuid().optional(),
  }),
});

export const operationsSchema = z.object({
  query: z.object(dateRangeQuery),
});

export const customersSchema = z.object({
  query: z.object({
    ...dateRangeQuery,
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});
