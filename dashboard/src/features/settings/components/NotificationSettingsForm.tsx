"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateNotificationSettings } from "../hooks/useUpdateNotificationSettings";
import {
  notificationSettingsSchema,
  type NotificationSettingsFormValues,
} from "../schemas/settings.schema";
import type { NotificationSettings } from "../types";
import { FormSection } from "./SettingsFormParts";

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
}

const getDefaults = (
  settings: NotificationSettings,
): NotificationSettingsFormValues => ({
  statusNotificationsEnabled: settings.statusNotificationsEnabled,
  cancellationNotificationsEnabled: settings.cancellationNotificationsEnabled,
});

export function NotificationSettingsForm({
  settings,
}: NotificationSettingsFormProps) {
  const mutation = useUpdateNotificationSettings();
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: getDefaults(settings),
  });

  useEffect(() => {
    if (!isDirty) {
      reset(getDefaults(settings));
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: NotificationSettingsFormValues) => {
    try {
      const updated = await mutation.mutateAsync(values);
      reset(getDefaults(updated.notifications));
      toast.success("Notification settings saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(
          error,
          "Unable to save notification settings.",
        ),
      );
    }
  };

  return (
    <FormSection
      title="Notifications"
      description="Choose which customer status changes should be sent through future notification flows."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save notification settings.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
          <input type="checkbox" {...register("statusNotificationsEnabled")} className="h-4 w-4 accent-primary" />
          Order status notifications
        </label>
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
          <input type="checkbox" {...register("cancellationNotificationsEnabled")} className="h-4 w-4 accent-primary" />
          Cancellation notifications
        </label>
      </div>
    </FormSection>
  );
}
