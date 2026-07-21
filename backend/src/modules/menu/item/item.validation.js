import { z } from "zod";

const itemBody = {
  categoryId: z.string().cuid(),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
};

export const createMenuItemSchema = z.object({
  body: z.object(itemBody),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    categoryId: itemBody.categoryId.optional(),
    name: itemBody.name.optional(),
    description: itemBody.description,
    image: itemBody.image,
    basePrice: itemBody.basePrice.optional(),
    isAvailable: itemBody.isAvailable.optional(),
    isFeatured: itemBody.isFeatured.optional(),
  }),
});

export const idSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    categoryId: z.string().cuid(),
  }),
});
