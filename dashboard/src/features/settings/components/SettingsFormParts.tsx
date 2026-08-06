import type { FormEventHandler, ReactNode } from "react";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

export const inputClassName =
  "mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60";

export const textareaClassName = `${inputClassName} resize-y`;

export const selectClassName = inputClassName;

export function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {message}
    </p>
  ) : null;
}

interface FormSectionProps {
  title: string;
  description: string;
  isDirty: boolean;
  isPending: boolean;
  isSuccess: boolean;
  errorMessage?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

export function FormSection({
  title,
  description,
  isDirty,
  isPending,
  isSuccess,
  errorMessage,
  onSubmit,
  children,
}: FormSectionProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <span
          className={
            isDirty
              ? "inline-flex w-fit items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800"
              : "inline-flex w-fit items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
          }
          role="status"
        >
          {isDirty ? "Unsaved changes" : isSuccess ? "Saved" : "Up to date"}
        </span>
      </div>

      {children}

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm">
          {errorMessage ? (
            <p className="text-red-600" role="alert">
              {errorMessage}
            </p>
          ) : isSuccess && !isDirty ? (
            <p className="text-emerald-700" role="status">
              Changes saved successfully.
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={isPending || !isDirty}>
          <Save />
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export const normalizeNullable = (value: string): string | null => {
  const normalized = value.trim();
  return normalized || null;
};

export const isMaskedPlaceholder = (value: string): boolean =>
  value.startsWith("••••");

export const maskedValueLabel = (value: string | null): string =>
  value ? `Configured: ${value}` : "Not configured";
