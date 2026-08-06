import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

import type { MenuOption } from "../types";
import { OptionCard } from "./OptionCard";

interface OptionListProps {
  options: MenuOption[];
  selectedOptionId: string | null;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onSelect: (optionId: string) => void;
  onEdit: (option: MenuOption) => void;
  onDelete: (option: MenuOption) => void;
  onToggleAvailability: (option: MenuOption) => void;
}

export function OptionList({
  options,
  selectedOptionId,
  isLoading,
  isError,
  isMutating,
  onCreate,
  onSelect,
  onEdit,
  onDelete,
  onToggleAvailability,
}: OptionListProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load options"
        description="Please try again shortly."
      />
    );
  }

  if (!options.length) {
    return (
      <EmptyState
        title="No options yet"
        description="Add the choices customers can select from this group."
        action={
          <Button type="button" onClick={onCreate}>
            Add Option
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          isSelected={option.id === selectedOptionId}
          isUpdating={isMutating}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleAvailability={onToggleAvailability}
        />
      ))}
    </div>
  );
}
