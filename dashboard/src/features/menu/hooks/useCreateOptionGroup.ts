import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { OptionGroup } from "../types";
import { updateMenuItemOptionGroups } from "./optionGroupCache";

export function useCreateOptionGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createOptionGroup,
    onSuccess: async (createdGroup, variables) => {
      const groupsKey = queryKeys.menu.optionGroups.byMenuItem(
        createdGroup.menuItemId || variables.menuItemId,
      );
      const groups = queryClient.getQueryData<OptionGroup[]>(groupsKey);

      if (groups) {
        queryClient.setQueryData<OptionGroup[]>(groupsKey, [
          ...groups,
          createdGroup,
        ]);
      }

      queryClient.setQueryData<OptionGroup>(
        queryKeys.menu.optionGroups.detail(createdGroup.id),
        createdGroup,
      );

      updateMenuItemOptionGroups(
        queryClient,
        createdGroup.menuItemId || variables.menuItemId,
        (cachedGroups) => [...cachedGroups, createdGroup],
      );

      await queryClient.invalidateQueries({
        queryKey: groupsKey,
        exact: true,
      });
    },
  });
}
