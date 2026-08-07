"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  categorySchema,
  type CategoryFormValues,
} from "../schemas/category.schema";
import type { MenuCategory } from "../types";

interface CategoryFormDialogProps {
  open: boolean;
  category: MenuCategory | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => void;
}

const getDefaultValues = (category: MenuCategory | null): CategoryFormValues => ({
  name: category?.name ?? "",
  description: category?.description ?? "",
  isActive: category?.isActive ?? true,
  sortOrder: category?.sortOrder ?? 0,
});

export function CategoryFormDialog({
  open,
  category,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(category);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: getDefaultValues(category),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(category));
    }
  }, [category, open, reset]);

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
        aria-label="Close category form"
        className="absolute inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      />

      <section
        aria-labelledby="category-form-title"
        aria-modal="true"
        className="relative z-10 my-8 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="category-form-title"
              className="text-lg font-semibold text-foreground"
            >
              {isEditing ? "Edit category" : "Add category"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep categories clear and easy for customers to scan.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close category form"
            title="Close"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X />
          </Button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="category-name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              id="category-name"
              type="text"
              autoFocus
              maxLength={100}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              className="mt-2 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
              placeholder="e.g. Burgers"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-destructive" role="alert">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="category-description"
              rows={3}
              {...register("description")}
              className="mt-2 w-full resize-y rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
              placeholder="Optional short description"
            />
            {errors.description ? (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-end">
            <label className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 accent-primary"
              />
              Active category
            </label>

            <div>
              <label
                htmlFor="category-sort-order"
                className="text-sm font-medium text-foreground"
              >
                Sort order
              </label>
              <input
                id="category-sort-order"
                type="number"
                min={0}
                step={1}
                {...register("sortOrder", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.sortOrder)}
                className="mt-2 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
              />
              {errors.sortOrder ? (
                <p className="mt-1 text-sm text-destructive" role="alert">
                  {errors.sortOrder.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
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
                  : "Create category"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
