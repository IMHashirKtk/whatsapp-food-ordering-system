import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuOption, UpdateMenuOptionRequest } from "../types";
import {
  getOptionGroupOptionSnapshots,
  restoreOptionGroupOptionSnapshots,
  updateOptionGroupOptions,
  type OptionGroupOptionCacheSnapshot,
} from "./optionCache";

interface UpdateOptionVariables {
  id: string;
  optionGroupId: string;
  payload: UpdateMenuOptionRequest;
}

interface UpdateOptionContext {
  previousSourceOptions: MenuOption[] | undefined;
  previousTargetOptions: MenuOption[] | undefined;
  previousDetail: MenuOption | undefined;
  previousSourceGroupCaches: OptionGroupOptionCacheSnapshot;
  previousTargetGroupCaches: OptionGroupOptionCacheSnapshot;
  sourceOptionGroupId: string;
  targetOptionGroupId: string;
}

const replaceOption = (options: MenuOption[], updatedOption: MenuOption) =>
  options.map((option) =>
    option.id === updatedOption.id ? { ...option, ...updatedOption } : option,
  );

export function useUpdateOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateOptionVariables) =>
      menuService.updateOption(id, payload),
    onMutate: async (
      variables,
    ): Promise<UpdateOptionContext> => {
      const sourceOptionGroupId = variables.optionGroupId;
      const targetOptionGroupId =
        variables.payload.optionGroupId ?? sourceOptionGroupId;
      const sourceOptionsKey =
        queryKeys.menu.options.byGroup(sourceOptionGroupId);
      const targetOptionsKey = queryKeys.menu.options.byGroup(
        targetOptionGroupId,
      );
      const detailKey = queryKeys.menu.options.detail(variables.id);

      await queryClient.cancelQueries({
        queryKey: sourceOptionsKey,
        exact: true,
      });
      if (targetOptionGroupId !== sourceOptionGroupId) {
        await queryClient.cancelQueries({
          queryKey: targetOptionsKey,
          exact: true,
        });
      }
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });

      const previousSourceOptions = queryClient.getQueryData<MenuOption[]>(
        sourceOptionsKey,
      );
      const previousTargetOptions =
        targetOptionGroupId !== sourceOptionGroupId
          ? queryClient.getQueryData<MenuOption[]>(targetOptionsKey)
          : undefined;
      const previousDetail = queryClient.getQueryData<MenuOption>(detailKey);
      const previousSourceGroupCaches = getOptionGroupOptionSnapshots(
        queryClient,
        sourceOptionGroupId,
      );
      const previousTargetGroupCaches =
        targetOptionGroupId !== sourceOptionGroupId
          ? getOptionGroupOptionSnapshots(queryClient, targetOptionGroupId)
          : [];
      const currentOption =
        previousDetail ??
        previousSourceOptions?.find((option) => option.id === variables.id);
      const optimisticOption = currentOption
        ? {
            ...currentOption,
            ...variables.payload,
            optionGroupId: targetOptionGroupId,
          }
        : null;

      if (optimisticOption && previousSourceOptions) {
        queryClient.setQueryData<MenuOption[]>(
          sourceOptionsKey,
          targetOptionGroupId === sourceOptionGroupId
            ? replaceOption(previousSourceOptions, optimisticOption)
            : previousSourceOptions.filter(
                (option) => option.id !== variables.id,
              ),
        );
      }

      if (
        optimisticOption &&
        targetOptionGroupId !== sourceOptionGroupId &&
        previousTargetOptions
      ) {
        queryClient.setQueryData<MenuOption[]>(targetOptionsKey, [
          ...previousTargetOptions,
          optimisticOption,
        ]);
      }

      if (optimisticOption) {
        queryClient.setQueryData<MenuOption>(detailKey, optimisticOption);

        if (targetOptionGroupId === sourceOptionGroupId) {
          updateOptionGroupOptions(
            queryClient,
            sourceOptionGroupId,
            (options) => replaceOption(options, optimisticOption),
          );
        } else {
          updateOptionGroupOptions(
            queryClient,
            sourceOptionGroupId,
            (options) => options.filter((option) => option.id !== variables.id),
          );
          updateOptionGroupOptions(
            queryClient,
            targetOptionGroupId,
            (options) =>
              options.some((option) => option.id === variables.id)
                ? replaceOption(options, optimisticOption)
                : [...options, optimisticOption],
          );
        }
      }

      return {
        previousSourceOptions,
        previousTargetOptions,
        previousDetail,
        previousSourceGroupCaches,
        previousTargetGroupCaches,
        sourceOptionGroupId,
        targetOptionGroupId,
      };
    },
    onError: (_error, variables, context) => {
      if (!context) {
        return;
      }

      if (context.previousSourceOptions !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.options.byGroup(context.sourceOptionGroupId),
          context.previousSourceOptions,
        );
      }

      if (context.previousTargetOptions !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.options.byGroup(context.targetOptionGroupId),
          context.previousTargetOptions,
        );
      }

      if (context.previousDetail !== undefined) {
        queryClient.setQueryData(
          queryKeys.menu.options.detail(variables.id),
          context.previousDetail,
        );
      } else {
        queryClient.removeQueries({
          queryKey: queryKeys.menu.options.detail(variables.id),
          exact: true,
        });
      }

      restoreOptionGroupOptionSnapshots(
        queryClient,
        context.previousSourceGroupCaches,
      );
      restoreOptionGroupOptionSnapshots(
        queryClient,
        context.previousTargetGroupCaches,
      );
    },
    onSuccess: async (updatedOption, variables) => {
      const sourceOptionGroupId = variables.optionGroupId;
      const targetOptionGroupId =
        variables.payload.optionGroupId ?? sourceOptionGroupId;
      const sourceOptionsKey =
        queryKeys.menu.options.byGroup(sourceOptionGroupId);
      const targetOptionsKey = queryKeys.menu.options.byGroup(
        targetOptionGroupId,
      );
      const currentTargetOptions = queryClient.getQueryData<MenuOption[]>(
        targetOptionsKey,
      );
      const currentSourceOptions = queryClient.getQueryData<MenuOption[]>(
        sourceOptionsKey,
      );
      const currentOption =
        currentTargetOptions?.find((option) => option.id === updatedOption.id) ??
        currentSourceOptions?.find((option) => option.id === updatedOption.id);
      const finalOption = currentOption
        ? { ...currentOption, ...updatedOption }
        : updatedOption;

      if (targetOptionGroupId === sourceOptionGroupId) {
        if (currentSourceOptions) {
          queryClient.setQueryData<MenuOption[]>(
            sourceOptionsKey,
            replaceOption(currentSourceOptions, finalOption),
          );
        }
        updateOptionGroupOptions(
          queryClient,
          sourceOptionGroupId,
          (options) => replaceOption(options, finalOption),
        );
      } else {
        if (currentSourceOptions) {
          queryClient.setQueryData<MenuOption[]>(
            sourceOptionsKey,
            currentSourceOptions.filter(
              (option) => option.id !== updatedOption.id,
            ),
          );
        }

        if (currentTargetOptions) {
          const hasOption = currentTargetOptions.some(
            (option) => option.id === updatedOption.id,
          );

          queryClient.setQueryData<MenuOption[]>(
            targetOptionsKey,
            hasOption
              ? replaceOption(currentTargetOptions, finalOption)
              : [...currentTargetOptions, finalOption],
          );
        }

        updateOptionGroupOptions(
          queryClient,
          sourceOptionGroupId,
          (options) => options.filter((option) => option.id !== updatedOption.id),
        );
        updateOptionGroupOptions(
          queryClient,
          targetOptionGroupId,
          (options) =>
            options.some((option) => option.id === updatedOption.id)
              ? replaceOption(options, finalOption)
              : [...options, finalOption],
        );
      }

      queryClient.setQueryData<MenuOption>(
        queryKeys.menu.options.detail(updatedOption.id),
        finalOption,
      );

      const shouldRefreshOrdering =
        variables.payload.sortOrder !== undefined ||
        targetOptionGroupId !== sourceOptionGroupId;

      if (shouldRefreshOrdering) {
        const optionGroupIds = new Set([
          sourceOptionGroupId,
          ...(targetOptionGroupId !== sourceOptionGroupId
            ? [targetOptionGroupId]
            : []),
        ]);

        await Promise.all(
          [...optionGroupIds].map((optionGroupId) =>
            queryClient.invalidateQueries({
              queryKey: queryKeys.menu.options.byGroup(optionGroupId),
              exact: true,
            }),
          ),
        );
      }
    },
  });
}
