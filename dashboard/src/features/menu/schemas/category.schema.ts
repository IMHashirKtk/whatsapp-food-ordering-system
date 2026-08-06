import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(100, "Category name cannot exceed 100 characters."),
  description: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z
    .number()
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative.")
    .default(0),
});

export type CategoryFormValues = z.input<typeof categorySchema>;
export type CategoryFormPayload = z.output<typeof categorySchema>;
