import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

import type { MenuItem } from "../types";
import { MenuItemCard } from "./MenuItemCard";

interface MenuItemListProps {
  items: MenuItem[];
  selectedItemId: string | null;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onSelect: (itemId: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onToggleFeatured: (item: MenuItem) => void;
}

export function MenuItemList({
  items,
  selectedItemId,
  isLoading,
  isError,
  isMutating,
  onCreate,
  onSelect,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
}: MenuItemListProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load menu items"
        description="Please try again shortly."
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No menu items yet"
        description="Add an item to start building this category."
        action={
          <Button type="button" onClick={onCreate}>
            Add Menu Item
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          isSelected={item.id === selectedItemId}
          isUpdating={isMutating}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleAvailability={onToggleAvailability}
          onToggleFeatured={onToggleFeatured}
        />
      ))}
    </div>
  );
}
