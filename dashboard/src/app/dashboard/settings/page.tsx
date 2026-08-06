"use client";

import PageHeader from "@/components/shared/PageHeader";

import { SettingsWorkspace } from "@/features/settings/components/SettingsWorkspace";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage the profile, ordering rules, payments, and integrations for your restaurant."
      />
      <SettingsWorkspace />
    </>
  );
}
