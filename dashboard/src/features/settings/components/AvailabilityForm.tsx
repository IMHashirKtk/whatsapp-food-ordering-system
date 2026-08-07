"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateAvailability } from "../hooks/useUpdateAvailability";
import {
  availabilitySchema,
  type AvailabilityFormValues,
} from "../schemas/settings.schema";
import type { SettingsData } from "../types";
import {
  FieldError,
  FormSection,
  inputClassName,
  normalizeNullable,
  textareaClassName,
} from "./SettingsFormParts";

interface AvailabilityFormProps {
  settings: SettingsData;
}

const getDefaults = (settings: SettingsData): AvailabilityFormValues => ({
  openingTime: settings.restaurant.openingTime ?? "",
  closingTime: settings.restaurant.closingTime ?? "",
  isOpen: settings.restaurant.isOpen,
  orderAcceptanceEnabled: settings.orderConfig.orderAcceptanceEnabled,
  temporaryClosureMessage: settings.orderConfig.temporaryClosureMessage ?? "",
});

export function AvailabilityForm({ settings }: AvailabilityFormProps) {
  const mutation = useUpdateAvailability();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: getDefaults(settings),
  });

  useEffect(() => {
    if (!isDirty) {
      reset(getDefaults(settings));
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: AvailabilityFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        openingTime: normalizeNullable(values.openingTime),
        closingTime: normalizeNullable(values.closingTime),
        isOpen: values.isOpen,
        orderAcceptanceEnabled: values.orderAcceptanceEnabled,
        temporaryClosureMessage: normalizeNullable(values.temporaryClosureMessage),
      });

      reset(getDefaults(updated));
      toast.success("Availability settings saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save availability settings."),
      );
    }
  };

  return (
    <FormSection
      title="Availability"
      description="Control whether the restaurant is open and accepting new orders."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save availability settings.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="settings-availability-opening" className="text-sm font-medium text-foreground">
            Opening time
          </label>
          <input id="settings-availability-opening" type="time" {...register("openingTime")} className={inputClassName} />
          <FieldError message={errors.openingTime?.message} />
        </div>

        <div>
          <label htmlFor="settings-availability-closing" className="text-sm font-medium text-foreground">
            Closing time
          </label>
          <input id="settings-availability-closing" type="time" {...register("closingTime")} className={inputClassName} />
          <FieldError message={errors.closingTime?.message} />
        </div>

        <label className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
          <input type="checkbox" {...register("isOpen")} className="h-4 w-4 accent-primary" />
          Restaurant is open
        </label>

        <label className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
          <input type="checkbox" {...register("orderAcceptanceEnabled")} className="h-4 w-4 accent-primary" />
          Accept new orders
        </label>

        <div className="md:col-span-2">
          <label htmlFor="settings-availability-closure" className="text-sm font-medium text-foreground">
            Temporary closure message
          </label>
          <textarea id="settings-availability-closure" rows={3} {...register("temporaryClosureMessage")} className={textareaClassName} placeholder="Optional message for a temporary closure" />
          <FieldError message={errors.temporaryClosureMessage?.message} />
        </div>
      </div>
    </FormSection>
  );
}
