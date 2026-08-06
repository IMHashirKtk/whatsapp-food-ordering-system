import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type {
  MenuCategory,
  MenuCategoryDetail,
  UpdateMenuCategoryRequest,
} from "../types";

interface UpdateCategoryVariables {
  id: string;
  payload: UpdateMenuCategoryRequest;
}

interface UpdateCategoryContext {
  previousCategories: MenuCategory[] | undefined;
  previousCategoryDetail: MenuCategoryDetail | undefined;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCategoryVariables) =>
      menuService.updateCategory(id, payload),
    onMutate: async (
      variables,
    ): Promise<UpdateCategoryContext> => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.menu.categories.all,
        exact: true,
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.menu.categories.detail(variables.id),
        exact: true,
      });

      const previousCategories = queryClient.getQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
      );
      const previousCategoryDetail = queryClient.getQueryData<MenuCategoryDetail>(
        queryKeys.menu.categories.detail(variables.id),
      );

      if (previousCategories) {
        queryClient.setQueryData<MenuCategory[]>(
          queryKeys.menu.categories.all,
          previousCategories.map((category) =>
            category.id === variables.id
              ? { ...category, ...variables.payload }
              : category,
          ),
        );
      }

      if (previousCategoryDetail) {
        queryClient.setQueryData<MenuCategoryDetail>(
          queryKeys.menu.categories.detail(variables.id),
          { ...previousCategoryDetail, ...variables.payload },
        );
      }

      return { previousCategories, previousCategoryDetail };
    },
    onError: (
      _error,
      variables,
      context: UpdateCategoryContext | undefined,
    ) => {
      if (context?.previousCategories !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.categories.all,
          context.previousCategories,
        );
      }

      if (context?.previousCategoryDetail !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.categories.detail(variables.id),
          context.previousCategoryDetail,
        );
      }
    },
    onSuccess: async (updatedCategory, variables) => {
      const categories = queryClient.getQueryData<MenuCategory[]>(
        queryKeys.menu.categories.all,
      );
      const currentCategory = categories?.find(
        (category) => category.id === variables.id,
      );

      if (categories) {
        queryClient.setQueryData<MenuCategory[]>(
          queryKeys.menu.categories.all,
          categories.map((category) =>
            category.id === updatedCategory.id
              ? {
                  ...updatedCategory,
                  _count: currentCategory?._count,
                }
              : category,
          ),
        );
      }

      queryClient.setQueryData<MenuCategoryDetail>(
        queryKeys.menu.categories.detail(updatedCategory.id),
        updatedCategory,
      );

      if (
        variables.payload.name !== undefined ||
        variables.payload.sortOrder !== undefined
      ) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.menu.categories.all,
          exact: true,
        });
      }
    },
  });
}
