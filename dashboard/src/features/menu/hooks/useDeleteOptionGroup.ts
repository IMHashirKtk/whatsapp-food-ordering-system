import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { OptionGroup } from "../types";
import { updateMenuItemOptionGroups } from "./optionGroupCache";

interface DeleteOptionGroupVariables {
  id: string;
  menuItemId: string;
}

export function useDeleteOptionGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteOptionGroupVariables) =>
      menuService.deleteOptionGroup(id),
    onSuccess: (_data, variables) => {
      const groupsKey = queryKeys.menu.optionGroups.byMenuItem(
        variables.menuItemId,
      );
      const groups = queryClient.getQueryData<OptionGroup[]>(groupsKey);

      if (groups) {
        queryClient.setQueryData<OptionGroup[]>(
          groupsKey,
          groups.filter((group) => group.id !== variables.id),
        );
      }

      updateMenuItemOptionGroups(
        queryClient,
        variables.menuItemId,
        (cachedGroups) =>
          cachedGroups.filter((group) => group.id !== variables.id),
      );

      queryClient.removeQueries({
        queryKey: queryKeys.menu.optionGroups.detail(variables.id),
        exact: true,
      });
    },
  });
}
