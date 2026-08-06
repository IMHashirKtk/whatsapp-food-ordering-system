import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

import type { MenuCategory } from "../types";
import { CategoryCard } from "./CategoryCard";

interface CategoryListProps {
  categories: MenuCategory[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onSelect: (categoryId: string) => void;
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
  onToggleStatus: (category: MenuCategory) => void;
}

export function CategoryList({
  categories,
  selectedCategoryId,
  isLoading,
  isError,
  isMutating,
  onCreate,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryListProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load categories"
        description="Please try again shortly."
      />
    );
  }

  if (!categories.length) {
    return (
      <EmptyState
        title="No categories yet"
        description="Create your first category to start organizing the menu."
        action={
          <Button type="button" onClick={onCreate}>
            Add Category
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          isSelected={category.id === selectedCategoryId}
          isUpdating={isMutating}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
