import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import type { MenuItem, OptionGroup } from "../types";

type MenuItemCacheData = MenuItem | MenuItem[];

export type MenuItemOptionGroupCacheSnapshot = Array<[
  QueryKey,
  MenuItemCacheData,
]>;

const updateItem = (
  item: MenuItem,
  menuItemId: string,
  updater: (groups: OptionGroup[]) => OptionGroup[],
) => {
  if (item.id !== menuItemId || !item.optionGroups) {
    return item;
  }

  return {
    ...item,
    optionGroups: updater(item.optionGroups),
  };
};

export const getMenuItemOptionGroupSnapshots = (
  queryClient: QueryClient,
  menuItemId: string,
): MenuItemOptionGroupCacheSnapshot => {
  const snapshots: MenuItemOptionGroupCacheSnapshot = [];

  queryClient
    .getQueriesData<MenuItemCacheData>({
      queryKey: queryKeys.menu.items.all,
    })
    .forEach(([queryKey, data]) => {
      if (!data) {
        return;
      }

      const containsItem = Array.isArray(data)
        ? data.some(
            (item) => item.id === menuItemId && item.optionGroups !== undefined,
          )
        : data.id === menuItemId && data.optionGroups !== undefined;

      if (containsItem) {
        snapshots.push([queryKey, data]);
      }
    });

  return snapshots;
};

export const updateMenuItemOptionGroups = (
  queryClient: QueryClient,
  menuItemId: string,
  updater: (groups: OptionGroup[]) => OptionGroup[],
) => {
  const cachedQueries = queryClient.getQueriesData<MenuItemCacheData>({
    queryKey: queryKeys.menu.items.all,
  });

  cachedQueries.forEach(([queryKey, data]) => {
    if (!data) {
      return;
    }

    if (Array.isArray(data)) {
      if (
        !data.some(
          (item) => item.id === menuItemId && item.optionGroups !== undefined,
        )
      ) {
        return;
      }

      queryClient.setQueryData<MenuItem[]>(
        queryKey,
        data.map((item) => updateItem(item, menuItemId, updater)),
      );
      return;
    }

    if (data.id === menuItemId && data.optionGroups !== undefined) {
      queryClient.setQueryData<MenuItem>(
        queryKey,
        updateItem(data, menuItemId, updater),
      );
    }
  });
};

export const restoreMenuItemOptionGroupSnapshots = (
  queryClient: QueryClient,
  snapshots: MenuItemOptionGroupCacheSnapshot,
) => {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
};
