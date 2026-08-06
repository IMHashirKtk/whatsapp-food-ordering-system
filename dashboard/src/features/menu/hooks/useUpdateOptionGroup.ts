import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { OptionGroup, UpdateOptionGroupRequest } from "../types";
import {
  getMenuItemOptionGroupSnapshots,
  restoreMenuItemOptionGroupSnapshots,
  updateMenuItemOptionGroups,
  type MenuItemOptionGroupCacheSnapshot,
} from "./optionGroupCache";

interface UpdateOptionGroupVariables {
  id: string;
  menuItemId: string;
  payload: UpdateOptionGroupRequest;
}

interface UpdateOptionGroupContext {
  previousSourceGroups: OptionGroup[] | undefined;
  previousTargetGroups: OptionGroup[] | undefined;
  previousDetail: OptionGroup | undefined;
  previousSourceItemCaches: MenuItemOptionGroupCacheSnapshot;
  previousTargetItemCaches: MenuItemOptionGroupCacheSnapshot;
  sourceMenuItemId: string;
  targetMenuItemId: string;
}

const replaceGroup = (groups: OptionGroup[], updatedGroup: OptionGroup) =>
  groups.map((group) =>
    group.id === updatedGroup.id ? { ...group, ...updatedGroup } : group,
  );

export function useUpdateOptionGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateOptionGroupVariables) =>
      menuService.updateOptionGroup(id, payload),
    onMutate: async (
      variables,
    ): Promise<UpdateOptionGroupContext> => {
      const sourceMenuItemId = variables.menuItemId;
      const targetMenuItemId =
        variables.payload.menuItemId ?? sourceMenuItemId;
      const sourceGroupsKey =
        queryKeys.menu.optionGroups.byMenuItem(sourceMenuItemId);
      const targetGroupsKey = queryKeys.menu.optionGroups.byMenuItem(
        targetMenuItemId,
      );
      const detailKey = queryKeys.menu.optionGroups.detail(variables.id);

      await queryClient.cancelQueries({
        queryKey: sourceGroupsKey,
        exact: true,
      });
      if (targetMenuItemId !== sourceMenuItemId) {
        await queryClient.cancelQueries({
          queryKey: targetGroupsKey,
          exact: true,
        });
      }
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });

      const previousSourceGroups = queryClient.getQueryData<OptionGroup[]>(
        sourceGroupsKey,
      );
      const previousTargetGroups =
        targetMenuItemId !== sourceMenuItemId
          ? queryClient.getQueryData<OptionGroup[]>(targetGroupsKey)
          : undefined;
      const previousDetail = queryClient.getQueryData<OptionGroup>(detailKey);
      const previousSourceItemCaches = getMenuItemOptionGroupSnapshots(
        queryClient,
        sourceMenuItemId,
      );
      const previousTargetItemCaches =
        targetMenuItemId !== sourceMenuItemId
          ? getMenuItemOptionGroupSnapshots(queryClient, targetMenuItemId)
          : [];
      const currentGroup =
        previousDetail ??
        previousSourceGroups?.find((group) => group.id === variables.id);
      const optimisticGroup = currentGroup
        ? {
            ...currentGroup,
            ...variables.payload,
            menuItemId: targetMenuItemId,
          }
        : null;

      if (optimisticGroup && previousSourceGroups) {
        queryClient.setQueryData<OptionGroup[]>(
          sourceGroupsKey,
          targetMenuItemId === sourceMenuItemId
            ? replaceGroup(previousSourceGroups, optimisticGroup)
            : previousSourceGroups.filter((group) => group.id !== variables.id),
        );
      }

      if (
        optimisticGroup &&
        targetMenuItemId !== sourceMenuItemId &&
        previousTargetGroups
      ) {
        queryClient.setQueryData<OptionGroup[]>(targetGroupsKey, [
          ...previousTargetGroups,
          optimisticGroup,
        ]);
      }

      if (optimisticGroup) {
        queryClient.setQueryData<OptionGroup>(detailKey, optimisticGroup);

        if (targetMenuItemId === sourceMenuItemId) {
          updateMenuItemOptionGroups(
            queryClient,
            sourceMenuItemId,
            (groups) => replaceGroup(groups, optimisticGroup),
          );
        } else {
          updateMenuItemOptionGroups(
            queryClient,
            sourceMenuItemId,
            (groups) => groups.filter((group) => group.id !== variables.id),
          );
          updateMenuItemOptionGroups(
            queryClient,
            targetMenuItemId,
            (groups) =>
              groups.some((group) => group.id === variables.id)
                ? replaceGroup(groups, optimisticGroup)
                : [...groups, optimisticGroup],
          );
        }
      }

      return {
        previousSourceGroups,
        previousTargetGroups,
        previousDetail,
        previousSourceItemCaches,
        previousTargetItemCaches,
        sourceMenuItemId,
        targetMenuItemId,
      };
    },
    onError: (_error, variables, context) => {
      if (!context) {
        return;
      }

      if (context.previousSourceGroups !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.optionGroups.byMenuItem(context.sourceMenuItemId),
          context.previousSourceGroups,
        );
      }

      if (context.previousTargetGroups !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.optionGroups.byMenuItem(context.targetMenuItemId),
          context.previousTargetGroups,
        );
      }

      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.optionGroups.detail(variables.id),
          context.previousDetail,
        );
      } else {
        queryClient.removeQueries({
          queryKey: queryKeys.menu.optionGroups.detail(variables.id),
          exact: true,
        });
      }

      restoreMenuItemOptionGroupSnapshots(
        queryClient,
        context.previousSourceItemCaches,
      );
      restoreMenuItemOptionGroupSnapshots(
        queryClient,
        context.previousTargetItemCaches,
      );
    },
    onSuccess: async (updatedGroup, variables) => {
      const sourceMenuItemId = variables.menuItemId;
      const targetMenuItemId =
        variables.payload.menuItemId ?? sourceMenuItemId;
      const sourceGroupsKey =
        queryKeys.menu.optionGroups.byMenuItem(sourceMenuItemId);
      const targetGroupsKey = queryKeys.menu.optionGroups.byMenuItem(
        targetMenuItemId,
      );
      const currentTargetGroups = queryClient.getQueryData<OptionGroup[]>(
        targetGroupsKey,
      );
      const currentSourceGroups = queryClient.getQueryData<OptionGroup[]>(
        sourceGroupsKey,
      );
      const currentGroup =
        currentTargetGroups?.find((group) => group.id === updatedGroup.id) ??
        currentSourceGroups?.find((group) => group.id === updatedGroup.id);
      const finalGroup = currentGroup
        ? { ...currentGroup, ...updatedGroup }
        : updatedGroup;

      if (targetMenuItemId === sourceMenuItemId) {
        if (currentSourceGroups) {
          queryClient.setQueryData<OptionGroup[]>(
            sourceGroupsKey,
            replaceGroup(currentSourceGroups, finalGroup),
          );
        }
        updateMenuItemOptionGroups(
          queryClient,
          sourceMenuItemId,
          (groups) => replaceGroup(groups, finalGroup),
        );
      } else {
        if (currentSourceGroups) {
          queryClient.setQueryData<OptionGroup[]>(
            sourceGroupsKey,
            currentSourceGroups.filter((group) => group.id !== updatedGroup.id),
          );
        }

        if (currentTargetGroups) {
          const hasGroup = currentTargetGroups.some(
            (group) => group.id === updatedGroup.id,
          );

          queryClient.setQueryData<OptionGroup[]>(
            targetGroupsKey,
            hasGroup
              ? replaceGroup(currentTargetGroups, finalGroup)
              : [...currentTargetGroups, finalGroup],
          );
        }

        updateMenuItemOptionGroups(
          queryClient,
          sourceMenuItemId,
          (groups) => groups.filter((group) => group.id !== updatedGroup.id),
        );
        updateMenuItemOptionGroups(
          queryClient,
          targetMenuItemId,
          (groups) =>
            groups.some((group) => group.id === updatedGroup.id)
              ? replaceGroup(groups, finalGroup)
              : [...groups, finalGroup],
        );
      }

      queryClient.setQueryData<OptionGroup>(
        queryKeys.menu.optionGroups.detail(updatedGroup.id),
        finalGroup,
      );

      const shouldRefreshOrdering =
        variables.payload.sortOrder !== undefined ||
        targetMenuItemId !== sourceMenuItemId;

      if (shouldRefreshOrdering) {
        const menuItemIds = new Set([
          sourceMenuItemId,
          ...(targetMenuItemId !== sourceMenuItemId
            ? [targetMenuItemId]
            : []),
        ]);

        await Promise.all(
          [...menuItemIds].map((menuItemId) =>
            queryClient.invalidateQueries({
              queryKey: queryKeys.menu.optionGroups.byMenuItem(menuItemId),
              exact: true,
            }),
          ),
        );
      }
    },
  });
}
