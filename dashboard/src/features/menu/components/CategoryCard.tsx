import { Pencil, Power, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
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
          onClick={() => onSelect(category.id)}
          aria-pressed={isSelected}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 break-words font-semibold text-foreground">
              {category.name}
            </h3>
            <StatusBadge
              tone={category.isActive ? "success" : "neutral"}
              className="px-2 py-1 text-[11px] uppercase tracking-wide"
            >
              {category.isActive ? "Active" : "Inactive"}
            </StatusBadge>
          </div>

          <p className="mt-2 min-h-5 text-sm leading-5 text-muted-foreground">
            {category.description || "No description added."}
          </p>

          {itemCount !== undefined ? (
            <p className="mt-3 text-xs font-medium text-muted-foreground">
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
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          {category.isActive ? "Visible to customers" : "Hidden from customers"}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={category.isActive}
          aria-label={`${category.isActive ? "Deactivate" : "Activate"} ${category.name}`}
          title={category.isActive ? "Deactivate category" : "Activate category"}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            category.isActive
              ? "border-success bg-success"
              : "border-border bg-muted",
          )}
          onClick={() => onToggleStatus(category)}
          disabled={isUpdating}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full bg-card shadow-sm transition-transform",
              category.isActive ? "translate-x-5" : "translate-x-0.5",
            )}
          >
            <Power
              className={cn(
                "h-3 w-3",
                category.isActive ? "text-success" : "text-muted-foreground",
              )}
            />
          </span>
        </button>
      </div>
    </article>
  );
}
