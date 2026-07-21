import { z } from "zod";

const body = {
  menuItemId: z.string().cuid(),
  name: z.string().trim().min(2).max(100),
  isRequired: z.boolean().default(false),
  minSelect: z.coerce.number().int().min(0),
  maxSelect: z.coerce.number().int().min(1),
  sortOrder: z.coerce.number().int().min(0).default(0),
};

export const createOptionGroupSchema = z.object({
  body: z.object(body),
});

export const updateOptionGroupSchema = z.object({
  body: z.object({
    menuItemId: body.menuItemId.optional(),
    name: body.name.optional(),
    isRequired: body.isRequired.optional(),
    minSelect: body.minSelect.optional(),
    maxSelect: body.maxSelect.optional(),
    sortOrder: body.sortOrder.optional(),
  }),
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
