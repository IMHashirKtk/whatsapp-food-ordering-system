import { z } from "zod";

export const optionGroupSchema = z
  .object({
    menuItemId: z.string().cuid("Please select a menu item."),
    name: z
      .string()
      .trim()
      .min(2, "Option group name must be at least 2 characters.")
      .max(100, "Option group name cannot exceed 100 characters."),
    isRequired: z.boolean().default(false),
    minSelect: z
      .number()
      .int("Minimum selections must be a whole number.")
      .min(0, "Minimum selections cannot be negative."),
    maxSelect: z
      .number()
      .int("Maximum selections must be a whole number.")
      .min(1, "Maximum selections must be at least 1."),
    sortOrder: z
      .number()
      .int("Sort order must be a whole number.")
      .min(0, "Sort order cannot be negative.")
      .default(0),
  })
  .superRefine((data, context) => {
    if (data.minSelect > data.maxSelect) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minSelect must be less than or equal to maxSelect.",
        path: ["minSelect"],
      });
    }

    if (data.isRequired && data.minSelect < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required option groups must allow at least one selection.",
        path: ["minSelect"],
      });
    }
  });

export type OptionGroupFormValues = z.input<typeof optionGroupSchema>;
export type OptionGroupFormPayload = z.output<typeof optionGroupSchema>;
