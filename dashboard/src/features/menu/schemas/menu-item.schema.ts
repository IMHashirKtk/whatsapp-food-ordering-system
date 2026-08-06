import { z } from "zod";

export const menuItemSchema = z.object({
  categoryId: z.string().cuid("Please select a category."),
  name: z
    .string()
    .trim()
    .min(2, "Menu item name must be at least 2 characters.")
    .max(100, "Menu item name cannot exceed 100 characters."),
  description: z.string().trim().optional(),
  basePrice: z.number().min(0, "Base price cannot be negative."),
  preparationTime: z
    .number()
    .int("Preparation time must be a whole number.")
    .min(0, "Preparation time cannot be negative.")
    .default(15),
  sortOrder: z
    .number()
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative.")
    .default(0),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type MenuItemFormValues = z.input<typeof menuItemSchema>;
export type MenuItemFormPayload = z.output<typeof menuItemSchema>;
