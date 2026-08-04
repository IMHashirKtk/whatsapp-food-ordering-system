import { z } from "zod";

const body = {
  menuItemId: z.string().cuid(),
  name: z.string().trim().min(2).max(100),
  isRequired: z.boolean().default(false),
  minSelect: z.coerce.number().int().min(0),
  maxSelect: z.coerce.number().int().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
};

const validateSelectionRules = (data, ctx) => {
  if (
    data.minSelect !== undefined &&
    data.maxSelect !== undefined &&
    data.minSelect > data.maxSelect
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "minSelect must be less than or equal to maxSelect.",
      path: ["minSelect"],
    });
  }

  if (
    data.isRequired === true &&
    data.minSelect !== undefined &&
    data.minSelect < 1
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Required option groups must allow at least one selection.",
      path: ["minSelect"],
    });
  }
};

export const createOptionGroupSchema = z.object({
  body: z.object(body).superRefine(validateSelectionRules),
});

export const updateOptionGroupSchema = z.object({
  body: z
    .object({
      menuItemId: body.menuItemId.optional(),
      name: body.name.optional(),
      isRequired: body.isRequired.optional(),
      minSelect: body.minSelect.optional(),
      maxSelect: body.maxSelect.optional(),
      sortOrder: body.sortOrder.optional(),
    })
    .superRefine(validateSelectionRules),
});

export const idSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const menuItemIdSchema = z.object({
  params: z.object({
    menuItemId: z.string().cuid(),
  }),
});
