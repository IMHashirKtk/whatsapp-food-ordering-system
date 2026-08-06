import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuOption } from "../types";
import { updateOptionGroupOptions } from "./optionCache";

export function useCreateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createOption,
    onSuccess: async (createdOption, variables) => {
      const optionsKey = queryKeys.menu.options.byGroup(
        createdOption.optionGroupId || variables.optionGroupId,
      );
      const options = queryClient.getQueryData<MenuOption[]>(optionsKey);

      if (options) {
        queryClient.setQueryData<MenuOption[]>(optionsKey, [
          ...options,
          createdOption,
        ]);
      }

      queryClient.setQueryData<MenuOption>(
        queryKeys.menu.options.detail(createdOption.id),
        createdOption,
      );

      updateOptionGroupOptions(
        queryClient,
        createdOption.optionGroupId || variables.optionGroupId,
        (cachedOptions) => [...cachedOptions, createdOption],
      );

      await queryClient.invalidateQueries({
        queryKey: optionsKey,
        exact: true,
      });
    },
  });
}
