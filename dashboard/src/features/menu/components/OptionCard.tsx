import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { MenuOption } from "../types";

interface OptionCardProps {
  option: MenuOption;
  isSelected: boolean;
  isUpdating: boolean;
  onSelect: (optionId: string) => void;
  onEdit: (option: MenuOption) => void;
  onDelete: (option: MenuOption) => void;
  onToggleAvailability: (option: MenuOption) => void;
}

const formatCurrency = (value: number | string) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(amount);
};

export function OptionCard({
  option,
  isSelected,
  isUpdating,
  onSelect,
  onEdit,
  onDelete,
  onToggleAvailability,
}: OptionCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        isSelected
          ? "border-primary bg-primary-soft shadow-sm"
          : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onSelect(option.id)}
          aria-pressed={isSelected}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="min-w-0 break-words font-semibold text-foreground">
              {option.name}
            </h4>
            <p className="shrink-0 font-semibold text-primary">
              {formatCurrency(option.extraPrice)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span>Order {option.sortOrder}</span>
            {option.optionGroup?.name ? (
              <span className="break-words">{option.optionGroup.name}</span>
            ) : null}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${option.name}`}
            title="Edit option"
            onClick={() => onEdit(option)}
            disabled={isUpdating}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${option.name}`}
            title="Delete option"
            onClick={() => onDelete(option)}
            disabled={isUpdating}
          >
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          {option.isAvailable ? "Available to customers" : "Unavailable"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={option.isAvailable}
          aria-label={`${option.isAvailable ? "Make" : "Keep"} ${option.name} available`}
          title={option.isAvailable ? "Mark unavailable" : "Mark available"}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            option.isAvailable
              ? "border-success bg-success"
              : "border-border bg-muted",
          )}
          onClick={() => onToggleAvailability(option)}
          disabled={isUpdating}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full bg-card shadow-sm transition-transform",
              option.isAvailable ? "translate-x-5" : "translate-x-0.5",
            )}
          >
            <Eye
              className={cn(
                "h-3 w-3",
                option.isAvailable ? "text-success" : "text-muted-foreground",
              )}
            />
          </span>
        </button>
      </div>
    </article>
  );
}
