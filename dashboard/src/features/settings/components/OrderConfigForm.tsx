"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateOrderConfig } from "../hooks/useUpdateOrderConfig";
import {
  orderConfigSchema,
  type OrderConfigFormValues,
} from "../schemas/settings.schema";
import type { OrderConfigSettings } from "../types";
import {
  FieldError,
  FormSection,
  inputClassName,
  normalizeNullable,
  textareaClassName,
} from "./SettingsFormParts";

interface OrderConfigFormProps {
  settings: OrderConfigSettings;
}

const getDefaults = (settings: OrderConfigSettings): OrderConfigFormValues => ({
  freeDeliveryThreshold: settings.freeDeliveryThreshold,
  minimumOrderAmount: settings.minimumOrderAmount,
  estimatedPreparationTime: settings.estimatedPreparationTime,
  orderAcceptanceEnabled: settings.orderAcceptanceEnabled,
  temporaryClosureMessage: settings.temporaryClosureMessage ?? "",
  orderPrefix: settings.orderPrefix,
  autoAcceptOrders: settings.autoAcceptOrders,
});

export function OrderConfigForm({ settings }: OrderConfigFormProps) {
  const mutation = useUpdateOrderConfig();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OrderConfigFormValues>({
    resolver: zodResolver(orderConfigSchema),
    defaultValues: getDefaults(settings),
  });

  useEffect(() => {
    if (!isDirty) {
      reset(getDefaults(settings));
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: OrderConfigFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        freeDeliveryThreshold: values.freeDeliveryThreshold,
        minimumOrderAmount: values.minimumOrderAmount,
        estimatedPreparationTime: values.estimatedPreparationTime,
        orderAcceptanceEnabled: values.orderAcceptanceEnabled,
        temporaryClosureMessage: normalizeNullable(values.temporaryClosureMessage),
        orderPrefix: values.orderPrefix.trim(),
        autoAcceptOrders: values.autoAcceptOrders,
      });

      reset(getDefaults(updated.orderConfig));
      toast.success("Order configuration saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save order configuration."),
      );
    }
  };

  return (
    <FormSection
      title="Order configuration"
      description="Set the commercial rules and order handling defaults used by the restaurant."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save order configuration.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="settings-order-free-delivery" className="text-sm font-medium text-foreground">
            Free-delivery threshold
          </label>
          <input id="settings-order-free-delivery" type="number" min={0} step="0.01" {...register("freeDeliveryThreshold", { valueAsNumber: true })} className={inputClassName} />
          <FieldError message={errors.freeDeliveryThreshold?.message} />
        </div>

        <div>
          <label htmlFor="settings-order-minimum" className="text-sm font-medium text-foreground">
            Minimum order amount
          </label>
          <input id="settings-order-minimum" type="number" min={0} step="0.01" {...register("minimumOrderAmount", { valueAsNumber: true })} className={inputClassName} />
          <FieldError message={errors.minimumOrderAmount?.message} />
        </div>

        <div>
          <label htmlFor="settings-order-prep" className="text-sm font-medium text-foreground">
            Estimated preparation time (minutes)
          </label>
          <input id="settings-order-prep" type="number" min={1} max={1440} step={1} {...register("estimatedPreparationTime", { valueAsNumber: true })} className={inputClassName} />
          <FieldError message={errors.estimatedPreparationTime?.message} />
        </div>

        <div>
          <label htmlFor="settings-order-prefix" className="text-sm font-medium text-foreground">
            Order prefix
          </label>
          <input id="settings-order-prefix" maxLength={20} {...register("orderPrefix")} className={inputClassName} />
          <FieldError message={errors.orderPrefix?.message} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="settings-order-closure" className="text-sm font-medium text-foreground">
            Temporary closure message
          </label>
          <textarea id="settings-order-closure" rows={3} {...register("temporaryClosureMessage")} className={textareaClassName} placeholder="Shown when ordering is temporarily unavailable" />
          <FieldError message={errors.temporaryClosureMessage?.message} />
        </div>

        <label className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
          <input type="checkbox" {...register("orderAcceptanceEnabled")} className="h-4 w-4 accent-primary" />
          Accept new orders
        </label>

        <label className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
          <input type="checkbox" {...register("autoAcceptOrders")} className="h-4 w-4 accent-primary" />
          Automatically accept orders
        </label>
      </div>
    </FormSection>
  );
}
