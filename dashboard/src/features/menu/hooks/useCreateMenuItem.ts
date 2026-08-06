import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuCategory, MenuItem } from "../types";

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createMenuItem,
    onSuccess: async (createdItem, variables) => {
      const categoryId = createdItem.categoryId || variables.categoryId;
      const itemsKey = queryKeys.menu.items.byCategory(categoryId);
      const items = queryClient.getQueryData<MenuItem[]>(itemsKey);

      if (items) {
        queryClient.setQueryData<MenuItem[]>(itemsKey, [...items, createdItem]);
      }

      queryClient.setQueryData<MenuItem>(
        queryKeys.menu.items.detail(createdItem.id),
        createdItem,
      );

      const categories = queryClient.getQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
      );

      if (categories) {
        queryClient.setQueryData<MenuCategory[]>(
          queryKeys.menu.categories.all,
          categories.map((category) =>
            category.id === categoryId && category._count
              ? {
                  ...category,
                  _count: {
                    menuItems: category._count.menuItems + 1,
                  },
                }
              : category,
          ),
        );
      }

      await queryClient.invalidateQueries({
        queryKey: itemsKey,
        exact: true,
      });
    },
  });
}
