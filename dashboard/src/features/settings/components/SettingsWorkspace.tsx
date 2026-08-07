"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Bot,
  Clock3,
  CreditCard,
  Globe2,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  Store,
} from "lucide-react";

import ErrorState from "@/components/shared/ErrorState";
import Loading from "@/components/shared/Loading";
import { useAuthStore } from "@/store/auth.store";

import { useSettings } from "../hooks/useSettings";
import { AISettingsForm } from "./AISettingsForm";
import { AvailabilityForm } from "./AvailabilityForm";
import { LocalizationForm } from "./LocalizationForm";
import { MetaSettingsForm } from "./MetaSettingsForm";
import { NotificationSettingsForm } from "./NotificationSettingsForm";
import { OrderConfigForm } from "./OrderConfigForm";
import { PaymentMethodsForm } from "./PaymentMethodsForm";
import { ProfileSettingsForm } from "./ProfileSettingsForm";
import { ReceiptSettingsForm } from "./ReceiptSettingsForm";

type SettingsTab =
  | "profile"
  | "orders"
  | "payments"
  | "availability"
  | "receipt"
  | "notifications"
  | "localization"
  | "ai"
  | "meta";

const tabs: Array<{
  id: SettingsTab;
  label: string;
  icon: typeof Store;
}> = [
  { id: "profile", label: "Profile", icon: Store },
  { id: "orders", label: "Orders", icon: SlidersHorizontal },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "availability", label: "Availability", icon: Clock3 },
  { id: "receipt", label: "Receipt", icon: ReceiptText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "localization", label: "Localization", icon: Globe2 },
  { id: "ai", label: "AI", icon: Bot },
  { id: "meta", label: "Meta", icon: ShieldCheck },
];

export function SettingsWorkspace() {
  const settingsQuery = useSettings();
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "OWNER";
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    if (!isOwner && activeTab === "meta") {
      setActiveTab("profile");
    }
  }, [activeTab, isOwner]);

  if (settingsQuery.isLoading) {
    return <Loading />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <ErrorState
        title="Unable to load settings"
        description="The settings could not be loaded. Please refresh and try again."
      />
    );
  }

  const settings = settingsQuery.data;
  const visibleTabs = isOwner ? tabs : tabs.filter((tab) => tab.id !== "meta");

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/50 px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Restaurant controls
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Settings workspace
            </h2>
          </div>
          <span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
            <span className="h-2 w-2 rounded-full bg-success" />
            {isOwner ? "Owner access" : "Manager access"}
          </span>
        </div>

        <div
          aria-label="Settings sections"
          className="mt-5 flex gap-1 overflow-x-auto pb-1"
          role="tablist"
        >
          {visibleTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`settings-panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={
                  isActive
                    ? "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    : "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground"
                }
              >
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div id="settings-panel-profile" role="tabpanel" hidden={activeTab !== "profile"}>
          <ProfileSettingsForm settings={settings.restaurant} />
        </div>
        <div id="settings-panel-orders" role="tabpanel" hidden={activeTab !== "orders"}>
          <OrderConfigForm settings={settings.orderConfig} />
        </div>
        <div id="settings-panel-payments" role="tabpanel" hidden={activeTab !== "payments"}>
          <PaymentMethodsForm
            settings={settings.paymentMethods}
            canEditRestrictedFields={isOwner}
          />
        </div>
        <div id="settings-panel-availability" role="tabpanel" hidden={activeTab !== "availability"}>
          <AvailabilityForm settings={settings} />
        </div>
        <div id="settings-panel-receipt" role="tabpanel" hidden={activeTab !== "receipt"}>
          <ReceiptSettingsForm settings={settings.receipt} />
        </div>
        <div id="settings-panel-notifications" role="tabpanel" hidden={activeTab !== "notifications"}>
          <NotificationSettingsForm settings={settings.notifications} />
        </div>
        <div id="settings-panel-localization" role="tabpanel" hidden={activeTab !== "localization"}>
          <LocalizationForm settings={settings.localization} />
        </div>
        <div id="settings-panel-ai" role="tabpanel" hidden={activeTab !== "ai"}>
          <AISettingsForm settings={settings.ai} />
        </div>
        {isOwner ? (
          <div id="settings-panel-meta" role="tabpanel" hidden={activeTab !== "meta"}>
            <MetaSettingsForm settings={settings.meta} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
