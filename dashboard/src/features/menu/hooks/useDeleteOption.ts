import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuOption } from "../types";
import { updateOptionGroupOptions } from "./optionCache";

interface DeleteOptionVariables {
  id: string;
  optionGroupId: string;
}

export function useDeleteOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteOptionVariables) => menuService.deleteOption(id),
    onSuccess: (_data, variables) => {
      const optionsKey = queryKeys.menu.options.byGroup(
        variables.optionGroupId,
      );
      const options = queryClient.getQueryData<MenuOption[]>(optionsKey);

      if (options) {
        queryClient.setQueryData<MenuOption[]>(
          optionsKey,
          options.filter((option) => option.id !== variables.id),
        );
      }

      updateOptionGroupOptions(
        queryClient,
        variables.optionGroupId,
        (cachedOptions) =>
          cachedOptions.filter((option) => option.id !== variables.id),
      );

      queryClient.removeQueries({
        queryKey: queryKeys.menu.options.detail(variables.id),
        exact: true,
      });
    },
  });
}
