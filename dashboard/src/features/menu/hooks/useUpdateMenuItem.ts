import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type {
  MenuCategory,
  MenuItem,
  UpdateMenuItemRequest,
} from "../types";

interface UpdateMenuItemVariables {
  id: string;
  categoryId: string;
  payload: UpdateMenuItemRequest;
}

interface UpdateMenuItemContext {
  previousCategories: MenuCategory[] | undefined;
  previousSourceItems: MenuItem[] | undefined;
  previousTargetItems: MenuItem[] | undefined;
  previousDetail: MenuItem | undefined;
  sourceCategoryId: string;
  targetCategoryId: string;
}

const replaceItem = (items: MenuItem[], updatedItem: MenuItem) =>
  items.map((item) =>
    item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
  );

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateMenuItemVariables) =>
      menuService.updateMenuItem(id, payload),
    onMutate: async (
      variables,
    ): Promise<UpdateMenuItemContext> => {
      const sourceCategoryId = variables.categoryId;
      const targetCategoryId =
        variables.payload.categoryId ?? sourceCategoryId;
      const sourceItemsKey =
        queryKeys.menu.items.byCategory(sourceCategoryId);
      const targetItemsKey = queryKeys.menu.items.byCategory(targetCategoryId);
      const detailKey = queryKeys.menu.items.detail(variables.id);

      await queryClient.cancelQueries({ queryKey: sourceItemsKey, exact: true });
      if (targetCategoryId !== sourceCategoryId) {
        await queryClient.cancelQueries({
          queryKey: targetItemsKey,
          exact: true,
        });
      }
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });

      const previousCategories = queryClient.getQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
      );
      const previousSourceItems = queryClient.getQueryData<MenuItem[]>(
        sourceItemsKey,
      );
      const previousTargetItems =
        targetCategoryId !== sourceCategoryId
          ? queryClient.getQueryData<MenuItem[]>(targetItemsKey)
          : undefined;
      const previousDetail = queryClient.getQueryData<MenuItem>(detailKey);
      const currentItem =
        previousDetail ??
        previousSourceItems?.find((item) => item.id === variables.id);
      const optimisticItem = currentItem
        ? { ...currentItem, ...variables.payload, categoryId: targetCategoryId }
        : null;

      if (optimisticItem && previousSourceItems) {
        queryClient.setQueryData<MenuItem[]>(
          sourceItemsKey,
          targetCategoryId === sourceCategoryId
            ? replaceItem(previousSourceItems, optimisticItem)
            : previousSourceItems.filter((item) => item.id !== variables.id),
        );
      }

      if (
        optimisticItem &&
        targetCategoryId !== sourceCategoryId &&
        previousTargetItems
      ) {
        queryClient.setQueryData<MenuItem[]>(targetItemsKey, [
          ...previousTargetItems,
          optimisticItem,
        ]);
      }

      if (optimisticItem) {
        queryClient.setQueryData<MenuItem>(detailKey, optimisticItem);
      }

      if (
        targetCategoryId !== sourceCategoryId &&
        previousCategories
      ) {
        queryClient.setQueryData<MenuCategory[]>(
          queryKeys.menu.categories.all,
          previousCategories.map((category) => {
            if (category.id === sourceCategoryId && category._count) {
              return {
                ...category,
                _count: {
                  menuItems: Math.max(category._count.menuItems - 1, 0),
                },
              };
            }

            if (category.id === targetCategoryId && category._count) {
              return {
                ...category,
                _count: {
                  menuItems: category._count.menuItems + 1,
                },
              };
            }

            return category;
          }),
        );
      }

      return {
        previousCategories,
        previousSourceItems,
        previousTargetItems,
        previousDetail,
        sourceCategoryId,
        targetCategoryId,
      };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      if (context.previousCategories !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.categories.all,
          context.previousCategories,
        );
      }

      if (context.previousSourceItems !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.items.byCategory(context.sourceCategoryId),
          context.previousSourceItems,
        );
      }

      if (context.previousTargetItems !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.items.byCategory(context.targetCategoryId),
          context.previousTargetItems,
        );
      }

      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.items.detail(_variables.id),
          context.previousDetail,
        );
      } else {
        queryClient.removeQueries({
          queryKey: queryKeys.menu.items.detail(_variables.id),
          exact: true,
        });
      }
    },
    onSuccess: async (updatedItem, variables) => {
      const sourceCategoryId = variables.categoryId;
      const targetCategoryId =
        variables.payload.categoryId ?? sourceCategoryId;
      const sourceItemsKey =
        queryKeys.menu.items.byCategory(sourceCategoryId);
      const targetItemsKey = queryKeys.menu.items.byCategory(targetCategoryId);
      const currentTargetItems = queryClient.getQueryData<MenuItem[]>(
        targetItemsKey,
      );
      const currentSourceItems = queryClient.getQueryData<MenuItem[]>(
        sourceItemsKey,
      );
      const currentItem =
        currentTargetItems?.find((item) => item.id === updatedItem.id) ??
        currentSourceItems?.find((item) => item.id === updatedItem.id);
      const finalItem = currentItem
        ? { ...currentItem, ...updatedItem }
        : updatedItem;

      if (targetCategoryId === sourceCategoryId) {
        if (currentSourceItems) {
          queryClient.setQueryData<MenuItem[]>(
            sourceItemsKey,
            replaceItem(currentSourceItems, finalItem),
          );
        }
      } else {
        if (currentSourceItems) {
          queryClient.setQueryData<MenuItem[]>(
            sourceItemsKey,
            currentSourceItems.filter((item) => item.id !== updatedItem.id),
          );
        }

        if (currentTargetItems) {
          const hasItem = currentTargetItems.some(
            (item) => item.id === updatedItem.id,
          );

          queryClient.setQueryData<MenuItem[]>(
            targetItemsKey,
            hasItem
              ? replaceItem(currentTargetItems, finalItem)
              : [...currentTargetItems, finalItem],
          );
        }
      }

      queryClient.setQueryData<MenuItem>(
        queryKeys.menu.items.detail(updatedItem.id),
        finalItem,
      );

      const keysToRefresh = new Set<string>([
        sourceCategoryId,
        ...(targetCategoryId !== sourceCategoryId ? [targetCategoryId] : []),
      ]);
      const shouldRefreshOrdering =
        variables.payload.name !== undefined ||
        variables.payload.sortOrder !== undefined ||
        targetCategoryId !== sourceCategoryId;

      if (shouldRefreshOrdering) {
        await Promise.all(
          [...keysToRefresh].map((categoryId) =>
            queryClient.invalidateQueries({
              queryKey: queryKeys.menu.items.byCategory(categoryId),
              exact: true,
            }),
          ),
        );
      }
    },
  });
}
