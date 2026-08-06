import { Pencil, Power, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { MenuCategory } from "../types";

interface CategoryCardProps {
  category: MenuCategory;
  isSelected: boolean;
  isUpdating: boolean;
  onSelect: (categoryId: string) => void;
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
  onToggleStatus: (category: MenuCategory) => void;
}

export function CategoryCard({
  category,
  isSelected,
  isUpdating,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryCardProps) {
  const itemCount = category._count?.menuItems;

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
          onClick={() => onSelect(category.id)}
          aria-pressed={isSelected}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 break-words font-semibold text-slate-900">
              {category.name}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                category.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="mt-2 min-h-5 text-sm leading-5 text-slate-500">
            {category.description || "No description added."}
          </p>

          {itemCount !== undefined ? (
            <p className="mt-3 text-xs font-medium text-slate-500">
              {itemCount} {itemCount === 1 ? "menu item" : "menu items"}
            </p>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${category.name}`}
            title="Edit category"
            onClick={() => onEdit(category)}
            disabled={isUpdating}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${category.name}`}
            title="Delete category"
            onClick={() => onDelete(category)}
            disabled={isUpdating}
          >
            <Trash2 className="text-red-600" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-500">
          {category.isActive ? "Visible to customers" : "Hidden from customers"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={category.isActive}
          aria-label={`${category.isActive ? "Deactivate" : "Activate"} ${category.name}`}
          title={category.isActive ? "Deactivate category" : "Activate category"}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            category.isActive
              ? "border-emerald-600 bg-emerald-600"
              : "border-slate-300 bg-slate-200",
          )}
          onClick={() => onToggleStatus(category)}
          disabled={isUpdating}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
              category.isActive ? "translate-x-5" : "translate-x-0.5",
            )}
          >
            <Power
              className={cn(
                "h-3 w-3",
                category.isActive ? "text-emerald-600" : "text-slate-400",
              )}
            />
          </span>
        </button>
      </div>
    </article>
  );
}
