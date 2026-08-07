"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";

import { useCreateCategory } from "../hooks/useCreateCategory";
import { useCreateMenuItem } from "../hooks/useCreateMenuItem";
import { useCreateOptionGroup } from "../hooks/useCreateOptionGroup";
import { useCreateOption } from "../hooks/useCreateOption";
import { useDeleteCategory } from "../hooks/useDeleteCategory";
import { useDeleteMenuItem } from "../hooks/useDeleteMenuItem";
import { useDeleteOptionGroup } from "../hooks/useDeleteOptionGroup";
import { useDeleteOption } from "../hooks/useDeleteOption";
import { useMenuCategories } from "../hooks/useMenuCategories";
import { useMenuItems } from "../hooks/useMenuItems";
import { useOptionGroups } from "../hooks/useOptionGroups";
import { useOptions } from "../hooks/useOptions";
import { useUpdateCategory } from "../hooks/useUpdateCategory";
import { useUpdateMenuItem } from "../hooks/useUpdateMenuItem";
import { useUpdateOptionGroup } from "../hooks/useUpdateOptionGroup";
import { useUpdateOption } from "../hooks/useUpdateOption";
import {
  categorySchema,
  type CategoryFormValues,
} from "../schemas/category.schema";
import {
  menuItemSchema,
  type MenuItemFormValues,
} from "../schemas/menu-item.schema";
import {
  optionGroupSchema,
  type OptionGroupFormValues,
} from "../schemas/option-group.schema";
import { optionSchema, type OptionFormValues } from "../schemas/option.schema";
import type {
  MenuCategory,
  MenuItem,
  MenuOption,
  OptionGroup,
} from "../types";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { CategoryList } from "./CategoryList";
import { MenuItemFormDialog } from "./MenuItemFormDialog";
import { MenuItemList } from "./MenuItemList";
import { OptionGroupFormDialog } from "./OptionGroupFormDialog";
import { OptionGroupList } from "./OptionGroupList";
import { OptionFormDialog } from "./OptionFormDialog";
import { OptionList } from "./OptionList";

type CategoryDialogState =
  | { mode: "create"; category: null }
  | { mode: "edit"; category: MenuCategory }
  | null;

type MenuItemDialogState =
  | { mode: "create"; item: null }
  | { mode: "edit"; item: MenuItem }
  | null;

type OptionGroupDialogState =
  | { mode: "create"; group: null }
  | { mode: "edit"; group: OptionGroup }
  | null;

type OptionDialogState =
  | { mode: "create"; option: null }
  | { mode: "edit"; option: MenuOption }
  | null;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: unknown }
      | undefined;

    if (typeof responseData?.message === "string") {
      return responseData.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
};

export function MenuWorkspace() {
  const categoriesQuery = useMenuCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const createOptionGroup = useCreateOptionGroup();
  const updateOptionGroup = useUpdateOptionGroup();
  const deleteOptionGroup = useDeleteOptionGroup();
  const createOption = useCreateOption();
  const updateOption = useUpdateOption();
  const deleteOption = useDeleteOption();
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedOptionGroupId, setSelectedOptionGroupId] = useState<
    string | null
  >(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    null,
  );
  const [categoryDialog, setCategoryDialog] =
    useState<CategoryDialogState>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<MenuCategory | null>(null);
  const [itemDialog, setItemDialog] = useState<MenuItemDialogState>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [optionGroupDialog, setOptionGroupDialog] =
    useState<OptionGroupDialogState>(null);
  const [optionGroupToDelete, setOptionGroupToDelete] =
    useState<OptionGroup | null>(null);
  const [optionDialog, setOptionDialog] = useState<OptionDialogState>(null);
  const [optionToDelete, setOptionToDelete] = useState<MenuOption | null>(
    null,
  );

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategoryId(null);
      return;
    }

    const selectedStillExists = categories.some(
      (category) => category.id === selectedCategoryId,
    );

    if (!selectedStillExists) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) ??
      null,
    [categories, selectedCategoryId],
  );
  const itemsQuery = useMenuItems(selectedCategoryId);
  const items = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);
  const selectedMenuItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );
  const optionGroupsQuery = useOptionGroups(selectedItemId);
  const optionGroups = useMemo(
    () => optionGroupsQuery.data ?? [],
    [optionGroupsQuery.data],
  );
  const selectedOptionGroup = useMemo(
    () =>
      optionGroups.find((group) => group.id === selectedOptionGroupId) ?? null,
    [optionGroups, selectedOptionGroupId],
  );
  const optionsQuery = useOptions(selectedOptionGroupId);
  const options = useMemo(
    () => optionsQuery.data ?? [],
    [optionsQuery.data],
  );

  useEffect(() => {
    if (!selectedCategoryId) {
      setSelectedItemId(null);
      return;
    }

    // Preserve an intentional selection while a newly selected category loads.
    if (itemsQuery.isLoading) {
      return;
    }

    if (!items.length) {
      setSelectedItemId(null);
      return;
    }

    const selectedStillExists = items.some((item) => item.id === selectedItemId);

    if (!selectedStillExists) {
      setSelectedOptionGroupId(null);
      setSelectedItemId(items[0].id);
    }
  }, [items, itemsQuery.isLoading, selectedCategoryId, selectedItemId]);

  useEffect(() => {
    if (!selectedItemId) {
      setSelectedOptionGroupId(null);
      return;
    }

    if (optionGroupsQuery.isLoading) {
      return;
    }

    if (!optionGroups.length) {
      setSelectedOptionGroupId(null);
      return;
    }

    const selectedStillExists = optionGroups.some(
      (group) => group.id === selectedOptionGroupId,
    );

    if (!selectedStillExists) {
      setSelectedOptionId(null);
      setSelectedOptionGroupId(optionGroups[0].id);
    }
  }, [optionGroups, optionGroupsQuery.isLoading, selectedItemId, selectedOptionGroupId]);

  useEffect(() => {
    if (!selectedOptionGroupId) {
      setSelectedOptionId(null);
      return;
    }

    if (optionsQuery.isLoading) {
      return;
    }

    if (!options.length) {
      setSelectedOptionId(null);
      return;
    }

    const selectedStillExists = options.some(
      (option) => option.id === selectedOptionId,
    );

    if (!selectedStillExists) {
      setSelectedOptionId(options[0].id);
    }
  }, [options, optionsQuery.isLoading, selectedOptionGroupId, selectedOptionId]);

  const categoryIsMutating =
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending;
  const itemIsMutating =
    createMenuItem.isPending ||
    updateMenuItem.isPending ||
    deleteMenuItem.isPending;
  const optionGroupIsMutating =
    createOptionGroup.isPending ||
    updateOptionGroup.isPending ||
    deleteOptionGroup.isPending;
  const optionIsMutating =
    createOption.isPending || updateOption.isPending || deleteOption.isPending;

  const openCreateCategoryDialog = () => {
    setCategoryDialog({ mode: "create", category: null });
  };

  const openEditCategoryDialog = (category: MenuCategory) => {
    setCategoryDialog({ mode: "edit", category });
  };

  const handleCategorySubmit = async (values: CategoryFormValues) => {
    try {
      const payload = categorySchema.parse(values);

      if (categoryDialog?.mode === "edit") {
        await updateCategory.mutateAsync({
          id: categoryDialog.category.id,
          payload,
        });
        toast.success("Category updated successfully.");
      } else {
        const createdCategory = await createCategory.mutateAsync(payload);
        setSelectedCategoryId(createdCategory.id);
        toast.success("Category created successfully.");
      }

      setCategoryDialog(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          categoryDialog?.mode === "edit"
            ? "Unable to update category."
            : "Unable to create category.",
        ),
      );
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    const categoryId = categoryToDelete.id;

    try {
      await deleteCategory.mutateAsync(categoryId);

      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setSelectedItemId(null);
        setSelectedOptionGroupId(null);
        setSelectedOptionId(null);
      }

      setCategoryToDelete(null);
      toast.success("Category deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete category."));
    }
  };

  const handleToggleCategoryStatus = async (category: MenuCategory) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        payload: { isActive: !category.isActive },
      });
      toast.success(
        category.isActive ? "Category deactivated." : "Category activated.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update category status."));
    }
  };

  const openCreateItemDialog = () => {
    if (!selectedCategoryId) {
      return;
    }

    setItemDialog({ mode: "create", item: null });
  };

  const openEditItemDialog = (item: MenuItem) => {
    setItemDialog({ mode: "edit", item });
  };

  const openCreateOptionGroupDialog = () => {
    if (!selectedItemId) {
      return;
    }

    setOptionGroupDialog({ mode: "create", group: null });
  };

  const openEditOptionGroupDialog = (group: OptionGroup) => {
    setOptionGroupDialog({ mode: "edit", group });
  };

  const openCreateOptionDialog = () => {
    if (!selectedOptionGroupId) {
      return;
    }

    setOptionDialog({ mode: "create", option: null });
  };

  const openEditOptionDialog = (option: MenuOption) => {
    setOptionDialog({ mode: "edit", option });
  };

  const handleItemSubmit = async (values: MenuItemFormValues) => {
    try {
      const payload = menuItemSchema.parse(values);

      if (itemDialog?.mode === "edit") {
        await updateMenuItem.mutateAsync({
          id: itemDialog.item.id,
          categoryId: itemDialog.item.categoryId,
          payload,
        });

        if (payload.categoryId === selectedCategoryId) {
          setSelectedItemId(itemDialog.item.id);
        } else if (selectedItemId === itemDialog.item.id) {
          setSelectedItemId(null);
          setSelectedOptionGroupId(null);
          setSelectedOptionId(null);
        }

        toast.success("Menu item updated successfully.");
      } else {
        const createdItem = await createMenuItem.mutateAsync(payload);

        if (payload.categoryId !== selectedCategoryId) {
          setSelectedCategoryId(payload.categoryId);
          setSelectedOptionGroupId(null);
          setSelectedOptionId(null);
        }
        setSelectedItemId(createdItem.id);
        toast.success("Menu item created successfully.");
      }

      setItemDialog(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          itemDialog?.mode === "edit"
            ? "Unable to update menu item."
            : "Unable to create menu item.",
        ),
      );
    }
  };

  const handleOptionGroupSubmit = async (values: OptionGroupFormValues) => {
    try {
      const payload = optionGroupSchema.parse(values);

      if (optionGroupDialog?.mode === "edit") {
        await updateOptionGroup.mutateAsync({
          id: optionGroupDialog.group.id,
          menuItemId: optionGroupDialog.group.menuItemId,
          payload,
        });

        if (payload.menuItemId === selectedItemId) {
          setSelectedOptionGroupId(optionGroupDialog.group.id);
        } else if (selectedOptionGroupId === optionGroupDialog.group.id) {
          setSelectedOptionGroupId(null);
          setSelectedOptionId(null);
        }

        toast.success("Option group updated successfully.");
      } else {
        const createdGroup = await createOptionGroup.mutateAsync(payload);

        if (payload.menuItemId !== selectedItemId) {
          setSelectedItemId(payload.menuItemId);
          setSelectedOptionId(null);
        }
        setSelectedOptionGroupId(createdGroup.id);
        toast.success("Option group created successfully.");
      }

      setOptionGroupDialog(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          optionGroupDialog?.mode === "edit"
            ? "Unable to update option group."
            : "Unable to create option group.",
        ),
      );
    }
  };

  const handleOptionSubmit = async (values: OptionFormValues) => {
    try {
      const payload = optionSchema.parse(values);

      if (optionDialog?.mode === "edit") {
        await updateOption.mutateAsync({
          id: optionDialog.option.id,
          optionGroupId: optionDialog.option.optionGroupId,
          payload,
        });

        if (payload.optionGroupId === selectedOptionGroupId) {
          setSelectedOptionId(optionDialog.option.id);
        } else if (selectedOptionId === optionDialog.option.id) {
          setSelectedOptionId(null);
        }

        toast.success("Option updated successfully.");
      } else {
        const createdOption = await createOption.mutateAsync(payload);

        if (payload.optionGroupId !== selectedOptionGroupId) {
          setSelectedOptionGroupId(payload.optionGroupId);
        }
        setSelectedOptionId(createdOption.id);
        toast.success("Option created successfully.");
      }

      setOptionDialog(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          optionDialog?.mode === "edit"
            ? "Unable to update option."
            : "Unable to create option.",
        ),
      );
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      await deleteMenuItem.mutateAsync({
        id: itemToDelete.id,
        categoryId: itemToDelete.categoryId,
      });

      if (selectedItemId === itemToDelete.id) {
        setSelectedItemId(null);
        setSelectedOptionGroupId(null);
        setSelectedOptionId(null);
      }

      setItemToDelete(null);
      toast.success("Menu item deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete menu item."));
    }
  };

  const handleDeleteOptionGroup = async () => {
    if (!optionGroupToDelete) {
      return;
    }

    try {
      await deleteOptionGroup.mutateAsync({
        id: optionGroupToDelete.id,
        menuItemId: optionGroupToDelete.menuItemId,
      });

      if (selectedOptionGroupId === optionGroupToDelete.id) {
        setSelectedOptionGroupId(null);
        setSelectedOptionId(null);
      }

      setOptionGroupToDelete(null);
      toast.success("Option group deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete option group."));
    }
  };

  const handleDeleteOption = async () => {
    if (!optionToDelete) {
      return;
    }

    try {
      await deleteOption.mutateAsync({
        id: optionToDelete.id,
        optionGroupId: optionToDelete.optionGroupId,
      });

      if (selectedOptionId === optionToDelete.id) {
        setSelectedOptionId(null);
      }

      setOptionToDelete(null);
      toast.success("Option deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete option."));
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem.mutateAsync({
        id: item.id,
        categoryId: item.categoryId,
        payload: { isAvailable: !item.isAvailable },
      });
      toast.success(
        item.isAvailable ? "Menu item marked unavailable." : "Menu item available.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update availability."));
    }
  };

  const handleToggleFeatured = async (item: MenuItem) => {
    try {
      await updateMenuItem.mutateAsync({
        id: item.id,
        categoryId: item.categoryId,
        payload: { isFeatured: !item.isFeatured },
      });
      toast.success(
        item.isFeatured
          ? "Menu item removed from featured items."
          : "Menu item marked as featured.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update featured status."));
    }
  };

  const handleToggleOptionAvailability = async (option: MenuOption) => {
    try {
      await updateOption.mutateAsync({
        id: option.id,
        optionGroupId: option.optionGroupId,
        payload: { isAvailable: !option.isAvailable },
      });
      toast.success(
        option.isAvailable
          ? "Option marked unavailable."
          : "Option marked available.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update option availability."));
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize the menu into clear sections for your customers.
            </p>
          </div>
          <Button type="button" onClick={openCreateCategoryDialog}>
            <Plus />
            Add Category
          </Button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
            <CategoryList
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              isLoading={categoriesQuery.isLoading}
              isError={categoriesQuery.isError}
              isMutating={categoryIsMutating}
              onCreate={openCreateCategoryDialog}
              onSelect={(categoryId) => {
                setSelectedCategoryId(categoryId);
                setSelectedItemId(null);
                setSelectedOptionGroupId(null);
                setSelectedOptionId(null);
              }}
              onEdit={openEditCategoryDialog}
              onDelete={setCategoryToDelete}
              onToggleStatus={handleToggleCategoryStatus}
            />
          </div>

          <div className="min-h-[420px] bg-muted/30 p-5 sm:p-7">
            {selectedCategory ? (
              <div>
                  <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        Selected category
                      </p>
                      <StatusBadge
                        tone={selectedCategory.isActive ? "success" : "neutral"}
                        className="px-2 py-1 text-[11px] uppercase tracking-wide"
                      >
                        {selectedCategory.isActive ? "Active" : "Inactive"}
                      </StatusBadge>
                    </div>
                    <h2 className="mt-2 break-words text-2xl font-semibold text-foreground">
                      {selectedCategory.name}
                    </h2>
                    {selectedCategory.description ? (
                      <p className="mt-2 max-w-2xl whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                        {selectedCategory.description}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={openCreateItemDialog}
                    disabled={itemIsMutating}
                  >
                    <Plus />
                    Add Menu Item
                  </Button>
                </div>

                <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
                  <div className="min-w-0">
                    <MenuItemList
                      items={items}
                      selectedItemId={selectedItemId}
                      isLoading={itemsQuery.isLoading}
                      isError={itemsQuery.isError}
                      isMutating={itemIsMutating}
                      onCreate={openCreateItemDialog}
                      onSelect={(itemId) => {
                        setSelectedItemId(itemId);
                        setSelectedOptionGroupId(null);
                        setSelectedOptionId(null);
                      }}
                      onEdit={openEditItemDialog}
                      onDelete={setItemToDelete}
                      onToggleAvailability={handleToggleAvailability}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  </div>

                  <aside className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-sm">
                    {selectedMenuItem ? (
                      <>
                        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                              Option groups
                            </p>
                            <h3 className="mt-1 break-words text-base font-semibold text-foreground">
                              {selectedMenuItem.name}
                            </h3>
                          </div>
                          <Button
                            type="button"
                            size="icon-sm"
                            aria-label="Add option group"
                            title="Add option group"
                            onClick={openCreateOptionGroupDialog}
                            disabled={optionGroupIsMutating}
                          >
                            <Plus />
                          </Button>
                        </div>

                        <div className="mt-4">
                          <OptionGroupList
                            groups={optionGroups}
                            selectedOptionGroupId={selectedOptionGroupId}
                            isLoading={optionGroupsQuery.isLoading}
                            isError={optionGroupsQuery.isError}
                            isMutating={optionGroupIsMutating}
                            onCreate={openCreateOptionGroupDialog}
                            onSelect={(groupId) => {
                              setSelectedOptionGroupId(groupId);
                              setSelectedOptionId(null);
                            }}
                            onEdit={openEditOptionGroupDialog}
                            onDelete={setOptionGroupToDelete}
                          />
                        </div>

                        {selectedOptionGroup ? (
                          <div className="mt-6 border-t border-border pt-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                                  Options
                                </p>
                                <h4 className="mt-1 break-words text-base font-semibold text-foreground">
                                  {selectedOptionGroup.name}
                                </h4>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={openCreateOptionDialog}
                                disabled={optionIsMutating}
                              >
                                <Plus />
                                Add Option
                              </Button>
                            </div>

                            <div className="mt-4">
                              <OptionList
                                options={options}
                                selectedOptionId={selectedOptionId}
                                isLoading={optionsQuery.isLoading}
                                isError={optionsQuery.isError}
                                isMutating={optionIsMutating}
                                onCreate={openCreateOptionDialog}
                                onSelect={setSelectedOptionId}
                                onEdit={openEditOptionDialog}
                                onDelete={setOptionToDelete}
                                onToggleAvailability={
                                  handleToggleOptionAvailability
                                }
                              />
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex min-h-[260px] items-center justify-center text-center">
                        <div className="max-w-xs">
                          <h3 className="text-base font-semibold text-foreground">
                            Select a menu item
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Choose a menu item to manage its option groups.
                          </p>
                        </div>
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center text-center">
                <div className="max-w-sm">
                  <h2 className="text-lg font-semibold text-foreground">
                    Select a category
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Choose a category from the list to view and manage its
                    menu items.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CategoryFormDialog
        open={categoryDialog !== null}
        category={categoryDialog?.category ?? null}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
        onOpenChange={(open) => {
          if (!open && !createCategory.isPending && !updateCategory.isPending) {
            setCategoryDialog(null);
          }
        }}
        onSubmit={handleCategorySubmit}
      />

      <ConfirmDialog
        open={categoryToDelete !== null}
        title="Delete category?"
        description={`Deleting ${categoryToDelete?.name ?? "this category"} may also delete its related menu items because of cascading relations. This action cannot be undone.`}
        confirmLabel="Delete category"
        variant="destructive"
        isConfirming={deleteCategory.isPending}
        onCancel={() => {
          if (!deleteCategory.isPending) {
            setCategoryToDelete(null);
          }
        }}
        onConfirm={() => void handleDeleteCategory()}
      />

      <MenuItemFormDialog
        open={itemDialog !== null}
        item={itemDialog?.item ?? null}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        isSubmitting={createMenuItem.isPending || updateMenuItem.isPending}
        onOpenChange={(open) => {
          if (!open && !createMenuItem.isPending && !updateMenuItem.isPending) {
            setItemDialog(null);
          }
        }}
        onSubmit={handleItemSubmit}
      />

      <ConfirmDialog
        open={itemToDelete !== null}
        title="Delete menu item?"
        description={`Deleting ${itemToDelete?.name ?? "this menu item"} may also delete its related option groups and options because of cascading relations. This action cannot be undone.`}
        confirmLabel="Delete menu item"
        variant="destructive"
        isConfirming={deleteMenuItem.isPending}
        onCancel={() => {
          if (!deleteMenuItem.isPending) {
            setItemToDelete(null);
          }
        }}
        onConfirm={() => void handleDeleteItem()}
      />

      <OptionGroupFormDialog
        open={optionGroupDialog !== null}
        group={optionGroupDialog?.group ?? null}
        menuItems={items}
        selectedMenuItemId={selectedItemId}
        isSubmitting={
          createOptionGroup.isPending || updateOptionGroup.isPending
        }
        onOpenChange={(open) => {
          if (
            !open &&
            !createOptionGroup.isPending &&
            !updateOptionGroup.isPending
          ) {
            setOptionGroupDialog(null);
          }
        }}
        onSubmit={handleOptionGroupSubmit}
      />

      <ConfirmDialog
        open={optionGroupToDelete !== null}
        title="Delete option group?"
        description={`Deleting ${optionGroupToDelete?.name ?? "this option group"} will also delete its related options because of cascading relations. This action cannot be undone.`}
        confirmLabel="Delete option group"
        variant="destructive"
        isConfirming={deleteOptionGroup.isPending}
        onCancel={() => {
          if (!deleteOptionGroup.isPending) {
            setOptionGroupToDelete(null);
          }
        }}
        onConfirm={() => void handleDeleteOptionGroup()}
      />

      <OptionFormDialog
        open={optionDialog !== null}
        option={optionDialog?.option ?? null}
        optionGroups={optionGroups}
        selectedOptionGroupId={selectedOptionGroupId}
        isSubmitting={createOption.isPending || updateOption.isPending}
        onOpenChange={(open) => {
          if (!open && !createOption.isPending && !updateOption.isPending) {
            setOptionDialog(null);
          }
        }}
        onSubmit={handleOptionSubmit}
      />

      <ConfirmDialog
        open={optionToDelete !== null}
        title="Delete option?"
        description={`Deleting ${optionToDelete?.name ?? "this option"} cannot be undone.`}
        confirmLabel="Delete option"
        variant="destructive"
        isConfirming={deleteOption.isPending}
        onCancel={() => {
          if (!deleteOption.isPending) {
            setOptionToDelete(null);
          }
        }}
        onConfirm={() => void handleDeleteOption()}
      />
    </>
  );
}
