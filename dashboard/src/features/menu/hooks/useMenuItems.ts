import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";
import type { MenuQueryOptions } from "../types";

export function useMenuItems(
  categoryId: string | null | undefined,
  options?: MenuQueryOptions,
) {
  const enabled = Boolean(categoryId) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.menu.items.byCategory(categoryId ?? ""),
    queryFn: () => menuService.getMenuItemsByCategory(categoryId ?? ""),
    enabled,
  });
}
