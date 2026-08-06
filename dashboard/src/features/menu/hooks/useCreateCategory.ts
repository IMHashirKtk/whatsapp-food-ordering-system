import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuCategory } from "../types";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createCategory,
    onSuccess: async (createdCategory) => {
      const categories = queryClient.getQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
      );

      if (categories) {
        queryClient.setQueryData<MenuCategory[]>(
          queryKeys.menu.categories.all,
          [...categories, createdCategory],
        );
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.menu.categories.all,
        exact: true,
      });
    },
  });
}
