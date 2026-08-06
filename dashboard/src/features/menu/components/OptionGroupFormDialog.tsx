"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  optionGroupSchema,
  type OptionGroupFormValues,
} from "../schemas/option-group.schema";
import type { MenuItem, OptionGroup } from "../types";

interface OptionGroupFormDialogProps {
  open: boolean;
  group: OptionGroup | null;
  menuItems: MenuItem[];
  selectedMenuItemId: string | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OptionGroupFormValues) => void;
}

const getDefaultValues = (
  group: OptionGroup | null,
  menuItems: MenuItem[],
  selectedMenuItemId: string | null,
): OptionGroupFormValues => ({
  menuItemId:
    group?.menuItemId ?? selectedMenuItemId ?? menuItems[0]?.id ?? "",
  name: group?.name ?? "",
  isRequired: group?.isRequired ?? false,
  minSelect: group?.minSelect ?? 0,
  maxSelect: group?.maxSelect ?? 1,
  sortOrder: group?.sortOrder ?? 0,
});

export function OptionGroupFormDialog({
  open,
  group,
  menuItems,
  selectedMenuItemId,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: OptionGroupFormDialogProps) {
  const isEditing = Boolean(group);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<OptionGroupFormValues>({
    resolver: zodResolver(optionGroupSchema),
    defaultValues: getDefaultValues(group, menuItems, selectedMenuItemId),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(group, menuItems, selectedMenuItemId));
    }
  }, [group, menuItems, open, reset, selectedMenuItemId]);

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
        aria-label="Close option group form"
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      />

      <section
        aria-labelledby="option-group-form-title"
        aria-modal="true"
        className="relative z-10 my-8 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="option-group-form-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing ? "Edit option group" : "Add option group"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Define how customers choose from this group.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close option group form"
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
              htmlFor="option-group-menu-item"
              className="text-sm font-medium text-slate-700"
            >
              Menu item
            </label>
            <select
              id="option-group-menu-item"
              {...register("menuItemId")}
              aria-invalid={Boolean(errors.menuItemId)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
            >
              {menuItems.map((menuItem) => (
                <option key={menuItem.id} value={menuItem.id}>
                  {menuItem.name}
                </option>
              ))}
            </select>
            {errors.menuItemId ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.menuItemId.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="option-group-name"
              className="text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="option-group-name"
              type="text"
              autoFocus
              maxLength={100}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              placeholder="e.g. Choose a sauce"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              {...register("isRequired")}
              className="h-4 w-4 accent-emerald-600"
            />
            Customer must choose from this group
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="option-group-min-select"
                className="text-sm font-medium text-slate-700"
              >
                Minimum selections
              </label>
              <input
                id="option-group-min-select"
                type="number"
                min={0}
                step={1}
                {...register("minSelect", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.minSelect)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
              {errors.minSelect ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.minSelect.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="option-group-max-select"
                className="text-sm font-medium text-slate-700"
              >
                Maximum selections
              </label>
              <input
                id="option-group-max-select"
                type="number"
                min={1}
                step={1}
                {...register("maxSelect", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.maxSelect)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
              {errors.maxSelect ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxSelect.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="option-group-sort-order"
              className="text-sm font-medium text-slate-700"
            >
              Sort order
            </label>
            <input
              id="option-group-sort-order"
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
                  : "Create option group"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
