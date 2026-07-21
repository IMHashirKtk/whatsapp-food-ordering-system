import { z } from "zod";

const body = {
  optionGroupId: z.string().cuid(),
  name: z.string().trim().min(2).max(100),
  extraPrice: z.coerce.number().min(0),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
};

export const createOptionSchema = z.object({
  body: z.object(body),
});

export const updateOptionSchema = z.object({
  body: z.object({
    optionGroupId: body.optionGroupId.optional(),
    name: body.name.optional(),
    extraPrice: body.extraPrice.optional(),
    isAvailable: body.isAvailable.optional(),
    sortOrder: body.sortOrder.optional(),
  }),
});

export const idSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const optionGroupIdSchema = z.object({
  params: z.object({
    optionGroupId: z.string().cuid(),
  }),
});
