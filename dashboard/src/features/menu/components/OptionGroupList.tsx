import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";

import type { OptionGroup } from "../types";
import { OptionGroupCard } from "./OptionGroupCard";

interface OptionGroupListProps {
  groups: OptionGroup[];
  selectedOptionGroupId: string | null;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  onCreate: () => void;
  onSelect: (groupId: string) => void;
  onEdit: (group: OptionGroup) => void;
  onDelete: (group: OptionGroup) => void;
}

export function OptionGroupList({
  groups,
  selectedOptionGroupId,
  isLoading,
  isError,
  isMutating,
  onCreate,
  onSelect,
  onEdit,
  onDelete,
}: OptionGroupListProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load option groups"
        description="Please try again shortly."
      />
    );
  }

  if (!groups.length) {
    return (
      <EmptyState
        title="No option groups yet"
        description="Add a group for choices such as sizes, sauces, or extras."
        action={
          <Button type="button" onClick={onCreate}>
            Add Option Group
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <OptionGroupCard
          key={group.id}
          group={group}
          isSelected={group.id === selectedOptionGroupId}
          isUpdating={isMutating}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
