"use client";

import PageHeader from "@/components/shared/PageHeader";

import { MenuWorkspace } from "@/features/menu/components/MenuWorkspace";

export default function MenuPage() {
  return (
    <>
      <PageHeader
        title="Menu"
        description="Organize the categories that shape your restaurant menu."
      />
      <MenuWorkspace />
    </>
  );
}
