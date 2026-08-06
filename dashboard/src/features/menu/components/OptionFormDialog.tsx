"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  optionSchema,
  type OptionFormValues,
} from "../schemas/option.schema";
import type { MenuOption, OptionGroup } from "../types";

interface OptionFormDialogProps {
  open: boolean;
  option: MenuOption | null;
  optionGroups: OptionGroup[];
  selectedOptionGroupId: string | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OptionFormValues) => void;
}

const getDefaultValues = (
  option: MenuOption | null,
  optionGroups: OptionGroup[],
  selectedOptionGroupId: string | null,
): OptionFormValues => {
  const extraPrice = option ? Number(option.extraPrice) : 0;

  return {
    optionGroupId:
      option?.optionGroupId ??
      selectedOptionGroupId ??
      optionGroups[0]?.id ??
      "",
    name: option?.name ?? "",
    extraPrice: Number.isFinite(extraPrice) ? extraPrice : 0,
    isAvailable: option?.isAvailable ?? true,
    sortOrder: option?.sortOrder ?? 0,
  };
};

export function OptionFormDialog({
  open,
  option,
  optionGroups,
  selectedOptionGroupId,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: OptionFormDialogProps) {
  const isEditing = Boolean(option);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<OptionFormValues>({
    resolver: zodResolver(optionSchema),
    defaultValues: getDefaultValues(
      option,
      optionGroups,
      selectedOptionGroupId,
    ),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(option, optionGroups, selectedOptionGroupId));
    }
  }, [open, option, optionGroups, reset, selectedOptionGroupId]);

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
        aria-label="Close option form"
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      />

      <section
        aria-labelledby="option-form-title"
        aria-modal="true"
        className="relative z-10 my-8 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="option-form-title"
              className="text-lg font-semibold text-slate-900"
            >
              {isEditing ? "Edit option" : "Add option"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a choice customers can select from this group.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close option form"
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
              htmlFor="option-group-id"
              className="text-sm font-medium text-slate-700"
            >
              Option group
            </label>
            <select
              id="option-group-id"
              {...register("optionGroupId")}
              aria-invalid={Boolean(errors.optionGroupId)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
            >
              {optionGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.optionGroupId ? (
              <p className="mt-1 text-sm text-red-600">
                {errors.optionGroupId.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="option-name"
              className="text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="option-name"
              type="text"
              autoFocus
              maxLength={100}
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              placeholder="e.g. Extra Cheese"
            />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_9rem] sm:items-end">
            <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                {...register("isAvailable")}
                className="h-4 w-4 accent-emerald-600"
              />
              Available to customers
            </label>

            <div>
              <label
                htmlFor="option-extra-price"
                className="text-sm font-medium text-slate-700"
              >
                Extra price (PKR)
              </label>
              <input
                id="option-extra-price"
                type="number"
                min={0}
                step="0.01"
                {...register("extraPrice", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.extraPrice)}
                className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              />
              {errors.extraPrice ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.extraPrice.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="option-sort-order"
              className="text-sm font-medium text-slate-700"
            >
              Sort order
            </label>
            <input
              id="option-sort-order"
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
                  : "Create option"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
