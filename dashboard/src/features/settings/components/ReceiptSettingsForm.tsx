"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateReceiptSettings } from "../hooks/useUpdateReceiptSettings";
import {
  receiptSettingsSchema,
  type ReceiptSettingsFormValues,
} from "../schemas/settings.schema";
import type { ReceiptSettings } from "../types";
import {
  FieldError,
  FormSection,
  normalizeNullable,
  textareaClassName,
} from "./SettingsFormParts";

interface ReceiptSettingsFormProps {
  settings: ReceiptSettings;
}

const getDefaults = (settings: ReceiptSettings): ReceiptSettingsFormValues => ({
  receiptFooter: settings.receiptFooter ?? "",
});

export function ReceiptSettingsForm({ settings }: ReceiptSettingsFormProps) {
  const mutation = useUpdateReceiptSettings();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ReceiptSettingsFormValues>({
    resolver: zodResolver(receiptSettingsSchema),
    defaultValues: getDefaults(settings),
  });

  useEffect(() => {
    if (!isDirty) {
      reset(getDefaults(settings));
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: ReceiptSettingsFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        receiptFooter: normalizeNullable(values.receiptFooter),
      });
      reset(getDefaults(updated.receipt));
      toast.success("Receipt settings saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save receipt settings."),
      );
    }
  };

  return (
    <FormSection
      title="Receipt"
      description="Add a short footer that can be used on future customer receipts."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save receipt settings.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label htmlFor="settings-receipt-footer" className="text-sm font-medium text-slate-700">
          Receipt footer
        </label>
        <textarea id="settings-receipt-footer" rows={4} {...register("receiptFooter")} className={textareaClassName} placeholder="Thank you for ordering with us." />
        <FieldError message={errors.receiptFooter?.message} />
      </div>
    </FormSection>
  );
}
