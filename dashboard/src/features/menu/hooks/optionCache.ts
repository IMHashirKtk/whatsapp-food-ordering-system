import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import type { MenuOption, OptionGroup } from "../types";

type OptionGroupCacheData = OptionGroup | OptionGroup[];

export type OptionGroupOptionCacheSnapshot = Array<[
  QueryKey,
  OptionGroupCacheData,
]>;

const updateGroup = (
  group: OptionGroup,
  optionGroupId: string,
  updater: (options: MenuOption[]) => MenuOption[],
) => {
  if (group.id !== optionGroupId || !group.options) {
    return group;
  }

  return {
    ...group,
    options: updater(group.options),
  };
};

export const getOptionGroupOptionSnapshots = (
  queryClient: QueryClient,
  optionGroupId: string,
): OptionGroupOptionCacheSnapshot => {
  const snapshots: OptionGroupOptionCacheSnapshot = [];

  queryClient
    .getQueriesData<OptionGroupCacheData>({
      queryKey: queryKeys.menu.optionGroups.all,
    })
    .forEach(([queryKey, data]) => {
      if (!data) {
        return;
      }

      const containsGroup = Array.isArray(data)
        ? data.some(
            (group) =>
              group.id === optionGroupId && group.options !== undefined,
          )
        : data.id === optionGroupId && data.options !== undefined;

      if (containsGroup) {
        snapshots.push([queryKey, data]);
      }
    });

  return snapshots;
};

export const updateOptionGroupOptions = (
  queryClient: QueryClient,
  optionGroupId: string,
  updater: (options: MenuOption[]) => MenuOption[],
) => {
  queryClient
    .getQueriesData<OptionGroupCacheData>({
      queryKey: queryKeys.menu.optionGroups.all,
    })
    .forEach(([queryKey, data]) => {
      if (!data) {
        return;
      }

      if (Array.isArray(data)) {
        if (
          !data.some(
            (group) =>
              group.id === optionGroupId && group.options !== undefined,
          )
        ) {
          return;
        }

        queryClient.setQueryData<OptionGroup[]>(
          queryKey,
          data.map((group) => updateGroup(group, optionGroupId, updater)),
        );
        return;
      }

      if (data.id === optionGroupId && data.options !== undefined) {
        queryClient.setQueryData<OptionGroup>(
          queryKey,
          updateGroup(data, optionGroupId, updater),
        );
      }
    });
};

export const restoreOptionGroupOptionSnapshots = (
  queryClient: QueryClient,
  snapshots: OptionGroupOptionCacheSnapshot,
) => {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
};
