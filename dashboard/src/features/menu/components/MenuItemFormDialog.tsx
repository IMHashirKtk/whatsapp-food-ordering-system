"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  menuItemSchema,
  type MenuItemFormValues,
} from "../schemas/menu-item.schema";
import type { MenuCategory, MenuItem } from "../types";

interface MenuItemFormDialogProps {
  open: boolean;
  item: MenuItem | null;
  categories: MenuCategory[];
  selectedCategoryId: string | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MenuItemFormValues) => void;
}

const getDefaultValues = (
  item: MenuItem | null,
  categories: MenuCategory[],
  selectedCategoryId: string | null,
): MenuItemFormValues => ({
  categoryId:
    item?.categoryId ?? selectedCategoryId ?? categories[0]?.id ?? "",
  name: item?.name ?? "",
  description: item?.description ?? "",
  basePrice: item ? Number(item.basePrice) : 0,
  preparationTime: item?.preparationTime ?? 15,
  sortOrder: item?.sortOrder ?? 0,
  isAvailable: item?.isAvailable ?? true,
  isFeatured: item?.isFeatured ?? false,
});

export function MenuItemFormDialog({
  open,
  item,
  categories,
  selectedCategoryId,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: MenuItemFormDialogProps) {
  const isEditing = Boolean(item);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: getDefaultValues(item, categories, selectedCategoryId),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(item, categories, selectedCategoryId));
    }
  }, [categories, item, open, reset, selectedCategoryId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Close menu item form"
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      />

      <section
        aria-labelledby="menu-item-form-title"
        aria-modal="true"
        className="relative z-10 my-8 w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="menu-item-form-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing ? "Edit menu item" : "Add menu item"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the details customers need before ordering.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close menu item form"
            title="Close"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X />
          </Button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem]">
            <div>
              <label
                htmlFor="menu-item-category"
                className="text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="menu-item-category"
                {...register("categoryId")}
                aria-invalid={Boolean(errors.categoryId)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="menu-item-price"
                className="text-sm font-medium text-slate-700"
              >
                Base price (PKR)
              </label>
              <input
                id="menu-item-price"
                type="number"
                min={0}
                step="0.01"
                {...register("basePrice", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.basePrice)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
              {errors.basePrice ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.basePrice.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="menu-item-name"
              className="text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="menu-item-name"
              type="text"
              autoFocus
              maxLength={100}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              placeholder="e.g. Classic Burger"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="menu-item-description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="menu-item-description"
              rows={3}
              {...register("description")}
              className="mt-2 w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              placeholder="Optional ingredients or serving details"
            />
            {errors.description ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="menu-item-preparation-time"
                className="text-sm font-medium text-slate-700"
              >
                Preparation time (minutes)
              </label>
              <input
                id="menu-item-preparation-time"
                type="number"
                min={0}
                step={1}
                {...register("preparationTime", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.preparationTime)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
              {errors.preparationTime ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.preparationTime.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="menu-item-sort-order"
                className="text-sm font-medium text-slate-700"
              >
                Sort order
              </label>
              <input
                id="menu-item-sort-order"
                type="number"
                min={0}
                step={1}
                {...register("sortOrder", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.sortOrder)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
              {errors.sortOrder ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.sortOrder.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                {...register("isAvailable")}
                className="h-4 w-4 accent-emerald-600"
              />
              Available to customers
            </label>
            <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="h-4 w-4 accent-emerald-600"
              />
              Featured item
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Create menu item"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
