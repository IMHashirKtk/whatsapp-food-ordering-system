export type MonetaryAmount = number | string;

export interface MenuItemCount {
  menuItems: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  restaurantId: string;
  _count?: MenuItemCount;
}

export interface MenuCategoryDetail extends MenuCategory {
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  image: string | null;
  basePrice: MonetaryAmount;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  restaurantId: string;
  category?: MenuCategory;
  optionGroups?: OptionGroup[];
}

export interface OptionGroup {
  id: string;
  menuItemId: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  menuItem?: MenuItem;
  options?: MenuOption[];
}

export interface MenuOption {
  id: string;
  optionGroupId: string;
  name: string;
  extraPrice: MonetaryAmount;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  optionGroup?: OptionGroup;
}

export interface CreateMenuCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateMenuCategoryRequest {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateMenuItemRequest {
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  basePrice: MonetaryAmount;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  sortOrder?: number;
}

export interface UpdateMenuItemRequest {
  categoryId?: string;
  name?: string;
  description?: string;
  image?: string;
  basePrice?: MonetaryAmount;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTime?: number;
  sortOrder?: number;
}

export interface CreateOptionGroupRequest {
  menuItemId: string;
  name: string;
  isRequired?: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder?: number;
}

export interface UpdateOptionGroupRequest {
  menuItemId?: string;
  name?: string;
  isRequired?: boolean;
  minSelect?: number;
  maxSelect?: number;
  sortOrder?: number;
}

export interface CreateMenuOptionRequest {
  optionGroupId: string;
  name: string;
  extraPrice: MonetaryAmount;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface UpdateMenuOptionRequest {
  optionGroupId?: string;
  name?: string;
  extraPrice?: MonetaryAmount;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface MenuQueryOptions {
  enabled?: boolean;
}
