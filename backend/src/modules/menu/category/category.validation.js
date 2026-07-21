import { z } from "zod";

const categoryBody = {
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
};

export const createCategorySchema = z.object({
  body: z.object(categoryBody),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: categoryBody.name.optional(),
    description: categoryBody.description,
    image: categoryBody.image,
    sortOrder: categoryBody.sortOrder.optional(),
    isActive: categoryBody.isActive.optional(),
  }),
});

export const idSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
