import type { FormEventHandler, ReactNode } from "react";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

export const inputClassName =
  "mt-2 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";

export const textareaClassName = `${inputClassName} resize-y`;

export const selectClassName = inputClassName;

export function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-1 text-sm text-destructive" role="alert">
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
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <span
          className={
            isDirty
              ? "inline-flex w-fit items-center rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning"
              : "inline-flex w-fit items-center rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
          }
          role="status"
        >
          {isDirty ? "Unsaved changes" : isSuccess ? "Saved" : "Up to date"}
        </span>
      </div>

      {children}

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm">
          {errorMessage ? (
            <p className="text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : isSuccess && !isDirty ? (
            <p className="text-success" role="status">
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
