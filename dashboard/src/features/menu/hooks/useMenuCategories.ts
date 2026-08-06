import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/config/queryKeys";

import { menuService } from "../services/menu.service";

export function useMenuCategories() {
  return useQuery({
    queryKey: queryKeys.menu.categories.all,
    queryFn: menuService.getCategories,
  });
}
