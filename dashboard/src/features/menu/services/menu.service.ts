import axiosClient from "@/lib/axios";
import { ApiResponse } from "@/types/api";

import {
  CreateMenuCategoryRequest,
  CreateMenuItemRequest,
  CreateMenuOptionRequest,
  CreateOptionGroupRequest,
  MenuCategory,
  MenuCategoryDetail,
  MenuItem,
  MenuOption,
  OptionGroup,
  UpdateMenuCategoryRequest,
  UpdateMenuItemRequest,
  UpdateMenuOptionRequest,
  UpdateOptionGroupRequest,
} from "../types";

export const menuService = {
  async getCategories(): Promise<MenuCategory[]> {
    const { data } =
      await axiosClient.get<ApiResponse<MenuCategory[]>>("/menu/categories");

    return data.data;
  },

  async getCategory(id: string): Promise<MenuCategoryDetail> {
    const { data } = await axiosClient.get<ApiResponse<MenuCategoryDetail>>(
      `/menu/categories/${id}`,
    );

    return data.data;
  },

  async createCategory(
    payload: CreateMenuCategoryRequest,
  ): Promise<MenuCategory> {
    const { data } = await axiosClient.post<ApiResponse<MenuCategory>>(
      "/menu/categories",
      payload,
    );

    return data.data;
  },

  async updateCategory(
    id: string,
    payload: UpdateMenuCategoryRequest,
  ): Promise<MenuCategoryDetail> {
    const { data } = await axiosClient.put<ApiResponse<MenuCategoryDetail>>(
      `/menu/categories/${id}`,
      payload,
    );

    return data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<null>>(`/menu/categories/${id}`);
  },

  async getMenuItems(): Promise<MenuItem[]> {
    const { data } =
      await axiosClient.get<ApiResponse<MenuItem[]>>("/menu/items");

    return data.data;
  },

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    const { data } = await axiosClient.get<ApiResponse<MenuItem[]>>(
      `/menu/items/category/${categoryId}`,
    );

    return data.data;
  },

  async getMenuItem(id: string): Promise<MenuItem> {
    const { data } = await axiosClient.get<ApiResponse<MenuItem>>(
      `/menu/items/${id}`,
    );

    return data.data;
  },

  async createMenuItem(payload: CreateMenuItemRequest): Promise<MenuItem> {
    const { data } = await axiosClient.post<ApiResponse<MenuItem>>(
      "/menu/items",
      payload,
    );

    return data.data;
  },

  async updateMenuItem(
    id: string,
    payload: UpdateMenuItemRequest,
  ): Promise<MenuItem> {
    const { data } = await axiosClient.put<ApiResponse<MenuItem>>(
      `/menu/items/${id}`,
      payload,
    );

    return data.data;
  },

  async deleteMenuItem(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<null>>(`/menu/items/${id}`);
  },

  async getOptionGroups(): Promise<OptionGroup[]> {
    const { data } =
      await axiosClient.get<ApiResponse<OptionGroup[]>>("/menu/option-groups");

    return data.data;
  },

  async getOptionGroupsByMenuItem(menuItemId: string): Promise<OptionGroup[]> {
    const { data } = await axiosClient.get<ApiResponse<OptionGroup[]>>(
      `/menu/option-groups/menu-item/${menuItemId}`,
    );

    return data.data;
  },

  async getOptionGroup(id: string): Promise<OptionGroup> {
    const { data } = await axiosClient.get<ApiResponse<OptionGroup>>(
      `/menu/option-groups/${id}`,
    );

    return data.data;
  },

  async createOptionGroup(
    payload: CreateOptionGroupRequest,
  ): Promise<OptionGroup> {
    const { data } = await axiosClient.post<ApiResponse<OptionGroup>>(
      "/menu/option-groups",
      payload,
    );

    return data.data;
  },

  async updateOptionGroup(
    id: string,
    payload: UpdateOptionGroupRequest,
  ): Promise<OptionGroup> {
    const { data } = await axiosClient.put<ApiResponse<OptionGroup>>(
      `/menu/option-groups/${id}`,
      payload,
    );

    return data.data;
  },

  async deleteOptionGroup(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<null>>(`/menu/option-groups/${id}`);
  },

  async getOptions(): Promise<MenuOption[]> {
    const { data } =
      await axiosClient.get<ApiResponse<MenuOption[]>>("/menu/options");

    return data.data;
  },

  async getOptionsByGroup(optionGroupId: string): Promise<MenuOption[]> {
    const { data } = await axiosClient.get<ApiResponse<MenuOption[]>>(
      `/menu/options/group/${optionGroupId}`,
    );

    return data.data;
  },

  async getOption(id: string): Promise<MenuOption> {
    const { data } = await axiosClient.get<ApiResponse<MenuOption>>(
      `/menu/options/${id}`,
    );

    return data.data;
  },

  async createOption(payload: CreateMenuOptionRequest): Promise<MenuOption> {
    const { data } = await axiosClient.post<ApiResponse<MenuOption>>(
      "/menu/options",
      payload,
    );

    return data.data;
  },

  async updateOption(
    id: string,
    payload: UpdateMenuOptionRequest,
  ): Promise<MenuOption> {
    const { data } = await axiosClient.put<ApiResponse<MenuOption>>(
      `/menu/options/${id}`,
      payload,
    );

    return data.data;
  },

  async deleteOption(id: string): Promise<void> {
    await axiosClient.delete<ApiResponse<null>>(`/menu/options/${id}`);
  },
};
