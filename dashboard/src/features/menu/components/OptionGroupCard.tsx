import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { OptionGroup } from "../types";

interface OptionGroupCardProps {
  group: OptionGroup;
  isSelected: boolean;
  isUpdating: boolean;
  onSelect: (groupId: string) => void;
  onEdit: (group: OptionGroup) => void;
  onDelete: (group: OptionGroup) => void;
}

export function OptionGroupCard({
  group,
  isSelected,
  isUpdating,
  onSelect,
  onEdit,
  onDelete,
}: OptionGroupCardProps) {
  const optionCount = group.options?.length;

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
          onClick={() => onSelect(group.id)}
          aria-pressed={isSelected}
        >
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="min-w-0 flex-1 break-words font-semibold text-slate-900">
              {group.name}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
                group.isRequired
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {group.isRequired ? "Required" : "Optional"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>
              Select {group.minSelect}-{group.maxSelect}
            </span>
            <span>Order {group.sortOrder}</span>
            {group.menuItem?.name ? (
              <span className="break-words">{group.menuItem.name}</span>
            ) : null}
            {optionCount !== undefined ? (
              <span>
                {optionCount} {optionCount === 1 ? "option" : "options"}
              </span>
            ) : null}
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${group.name}`}
            title="Edit option group"
            onClick={() => onEdit(group)}
            disabled={isUpdating}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${group.name}`}
            title="Delete option group"
            onClick={() => onDelete(group)}
            disabled={isUpdating}
          >
            <Trash2 className="text-red-600" />
          </Button>
        </div>
      </div>
    </article>
  );
}
