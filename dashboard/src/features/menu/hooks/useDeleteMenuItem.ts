import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuCategory, MenuItem } from "../types";

interface DeleteMenuItemVariables {
  id: string;
  categoryId: string;
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteMenuItemVariables) =>
      menuService.deleteMenuItem(id),
    onSuccess: (_data, variables) => {
      const itemsKey = queryKeys.menu.items.byCategory(variables.categoryId);
      const items = queryClient.getQueryData<MenuItem[]>(itemsKey);

      if (items) {
        queryClient.setQueryData<MenuItem[]>(
          itemsKey,
          items.filter((item) => item.id !== variables.id),
        );
      }

      queryClient.removeQueries({
        queryKey: queryKeys.menu.items.detail(variables.id),
        exact: true,
      });

      const categories = queryClient.getQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
      );

      if (categories) {
        queryClient.setQueryData<MenuCategory[]>(
          queryKeys.menu.categories.all,
          categories.map((category) =>
            category.id === variables.categoryId && category._count
              ? {
                  ...category,
                  _count: {
                    menuItems: Math.max(category._count.menuItems - 1, 0),
                  },
                }
              : category,
          ),
        );
      }
    },
  });
}
