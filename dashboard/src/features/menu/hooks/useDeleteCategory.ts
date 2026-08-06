import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuCategory } from "../types";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.deleteCategory,
    onSuccess: (_data, categoryId) => {
      const categories = queryClient.getQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
      );

      queryClient.setQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
        categories?.filter((category) => category.id !== categoryId),
      );
      queryClient.removeQueries({
        queryKey: queryKeys.menu.categories.detail(categoryId),
        exact: true,
      });
    },
  });
}
