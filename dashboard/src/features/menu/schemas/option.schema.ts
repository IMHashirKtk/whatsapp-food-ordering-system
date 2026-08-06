import { z } from "zod";

export const optionSchema = z.object({
  optionGroupId: z.string().cuid("Please select an option group."),
  name: z
    .string()
    .trim()
    .min(2, "Option name must be at least 2 characters.")
    .max(100, "Option name cannot exceed 100 characters."),
  extraPrice: z.number().min(0, "Extra price cannot be negative."),
  isAvailable: z.boolean().default(true),
  sortOrder: z
    .number()
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative.")
    .default(0),
});

export type OptionFormValues = z.input<typeof optionSchema>;
export type OptionFormPayload = z.output<typeof optionSchema>;
