import { Clock3, Eye, Pencil, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { MenuItem } from "../types";

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  isUpdating: boolean;
  onSelect: (itemId: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onToggleFeatured: (item: MenuItem) => void;
}

const formatCurrency = (value: number | string) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
  }).format(amount);
};

export function MenuItemCard({
  item,
  isSelected,
  isUpdating,
  onSelect,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
}: MenuItemCardProps) {
  const optionGroupCount = item.optionGroups?.length;

  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4 transition-colors",
        isSelected
          ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
          : "border-slate-200 hover:border-slate-300",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-emerald-500"
          onClick={() => onSelect(item.id)}
          aria-pressed={isSelected}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 break-words font-semibold text-slate-900">
              {item.name}
            </h3>
            <p className="shrink-0 font-semibold text-emerald-700">
              {formatCurrency(item.basePrice)}
            </p>
          </div>

          <p className="mt-2 min-h-5 whitespace-pre-wrap break-words text-sm leading-5 text-slate-500">
            {item.description || "No description added."}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {item.preparationTime} min prep
            </span>
            <span>Order {item.sortOrder}</span>
            {item.category?.name ? <span>{item.category.name}</span> : null}
            {optionGroupCount !== undefined ? (
              <span>
                {optionGroupCount} {optionGroupCount === 1 ? "option group" : "option groups"}
              </span>
            ) : null}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${item.name}`}
            title="Edit menu item"
            onClick={() => onEdit(item)}
            disabled={isUpdating}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${item.name}`}
            title="Delete menu item"
            onClick={() => onDelete(item)}
            disabled={isUpdating}
          >
            <Trash2 className="text-red-600" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          role="switch"
          aria-checked={item.isAvailable}
          aria-label={`${item.isAvailable ? "Make" : "Keep"} ${item.name} available`}
          title={item.isAvailable ? "Mark unavailable" : "Mark available"}
          className={cn(
            "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            item.isAvailable
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-500",
          )}
          onClick={() => onToggleAvailability(item)}
          disabled={isUpdating}
        >
          <Eye className="h-3.5 w-3.5" />
          {item.isAvailable ? "Available" : "Unavailable"}
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={item.isFeatured}
          aria-label={`${item.isFeatured ? "Remove" : "Mark"} ${item.name} as featured`}
          title={item.isFeatured ? "Remove featured status" : "Mark as featured"}
          className={cn(
            "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            item.isFeatured
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-slate-200 bg-slate-50 text-slate-500",
          )}
          onClick={() => onToggleFeatured(item)}
          disabled={isUpdating}
        >
          <Star className="h-3.5 w-3.5" />
          {item.isFeatured ? "Featured" : "Standard"}
        </button>
      </div>
    </article>
  );
}
