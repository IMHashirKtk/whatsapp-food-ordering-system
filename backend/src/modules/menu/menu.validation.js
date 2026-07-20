import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters.")
      .max(100),

    description: z.string().trim().max(500).optional(),

    image: z.string().url().optional(),

    isActive: z.boolean().optional(),

    sortOrder: z.number().int().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(500).optional(),

    image: z.string().url().optional(),

    isActive: z.boolean().optional(),

    sortOrder: z.number().int().optional(),
  }),
});

export const createMenuItemSchema = z.object({
  body: z.object({
    categoryId: z.string().cuid(),

    name: z.string().trim().min(2).max(150),

    description: z.string().trim().optional(),

    image: z.string().url().optional(),

    basePrice: z.coerce.number().positive(),

    isAvailable: z.boolean().optional(),

    isFeatured: z.boolean().optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    categoryId: z.string().cuid().optional(),

    name: z.string().trim().min(2).max(150).optional(),

    description: z.string().trim().optional(),

    image: z.string().url().optional(),

    basePrice: z.coerce.number().positive().optional(),

    isAvailable: z.boolean().optional(),

    isFeatured: z.boolean().optional(),
  }),
});

export const createOptionGroupSchema = z.object({
  body: z.object({
    menuItemId: z.string().cuid(),

    name: z.string().trim().min(2).max(100),

    isRequired: z.boolean().optional(),

    minSelect: z.coerce.number().int().min(0).optional(),

    maxSelect: z.coerce.number().int().min(1).optional(),

    sortOrder: z.coerce.number().int().optional(),
  }),
});

export const updateOptionGroupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),

    isRequired: z.boolean().optional(),

    minSelect: z.coerce.number().int().min(0).optional(),

    maxSelect: z.coerce.number().int().min(1).optional(),

    sortOrder: z.coerce.number().int().optional(),
  }),
});

export const createOptionSchema = z.object({
  body: z.object({
    optionGroupId: z.string().cuid(),

    name: z.string().trim().min(1).max(100),

    extraPrice: z.coerce.number(),

    isAvailable: z.boolean().optional(),

    sortOrder: z.coerce.number().int().optional(),
  }),
});

export const updateOptionSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(100).optional(),

    extraPrice: z.coerce.number().optional(),

    isAvailable: z.boolean().optional(),

    sortOrder: z.coerce.number().int().optional(),
  }),
});

export const menuItemIdSchema = z.object({
  params: z.object({
    menuItemId: z.string().cuid(),
  }),
});

export const optionGroupIdSchema = z.object({
  params: z.object({
    optionGroupId: z.string().cuid(),
  }),
});

export const idSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
