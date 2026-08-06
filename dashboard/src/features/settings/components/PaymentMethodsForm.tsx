"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdatePaymentMethods } from "../hooks/useUpdatePaymentMethods";
import {
  paymentMethodsSchema,
  type PaymentMethodsFormValues,
} from "../schemas/settings.schema";
import type { PaymentMethodSettings } from "../types";
import {
  FieldError,
  FormSection,
  inputClassName,
  maskedValueLabel,
  normalizeNullable,
  textareaClassName,
} from "./SettingsFormParts";

interface PaymentMethodsFormProps {
  settings: PaymentMethodSettings;
  canEditRestrictedFields: boolean;
}

const getDefaults = (settings: PaymentMethodSettings): PaymentMethodsFormValues => ({
  codEnabled: settings.codEnabled,
  easypaisaEnabled: settings.easypaisaEnabled,
  easypaisaNumber: settings.easypaisaNumber ?? "",
  jazzcashEnabled: settings.jazzcashEnabled,
  jazzcashNumber: settings.jazzcashNumber ?? "",
  bankTransferEnabled: settings.bankTransferEnabled,
  bankName: settings.bankName ?? "",
  bankAccountTitle: settings.bankAccountTitle ?? "",
  bankAccountNumber: settings.bankAccountNumber ?? "",
  paymentInstructions: settings.paymentInstructions ?? "",
});

const changedNullableValue = (
  value: string,
  initialValue: string,
): string | null | undefined => {
  if (value === initialValue) {
    return undefined;
  }

  return normalizeNullable(value);
};

export function PaymentMethodsForm({
  settings,
  canEditRestrictedFields,
}: PaymentMethodsFormProps) {
  const mutation = useUpdatePaymentMethods();
  const defaultsRef = useRef(getDefaults(settings));
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PaymentMethodsFormValues>({
    resolver: zodResolver(paymentMethodsSchema),
    defaultValues: defaultsRef.current,
  });

  useEffect(() => {
    if (!isDirty) {
      const nextDefaults = getDefaults(settings);
      defaultsRef.current = nextDefaults;
      reset(nextDefaults);
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: PaymentMethodsFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        codEnabled: values.codEnabled,
        easypaisaEnabled: values.easypaisaEnabled,
        jazzcashEnabled: values.jazzcashEnabled,
        bankTransferEnabled: values.bankTransferEnabled,
        paymentInstructions: normalizeNullable(values.paymentInstructions),
        ...(canEditRestrictedFields
          ? {
              easypaisaNumber: changedNullableValue(
                values.easypaisaNumber,
                defaultsRef.current.easypaisaNumber,
              ),
              jazzcashNumber: changedNullableValue(
                values.jazzcashNumber,
                defaultsRef.current.jazzcashNumber,
              ),
              bankName: changedNullableValue(
                values.bankName,
                defaultsRef.current.bankName,
              ),
              bankAccountTitle: changedNullableValue(
                values.bankAccountTitle,
                defaultsRef.current.bankAccountTitle,
              ),
              bankAccountNumber: changedNullableValue(
                values.bankAccountNumber,
                defaultsRef.current.bankAccountNumber,
              ),
            }
          : {}),
      });

      const nextDefaults = getDefaults(updated.paymentMethods);
      defaultsRef.current = nextDefaults;
      reset(nextDefaults);
      toast.success("Payment methods saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save payment methods."),
      );
    }
  };

  return (
    <FormSection
      title="Payment methods"
      description="Choose the methods customers can use and keep account details protected."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save payment methods.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("codEnabled")} className="h-4 w-4 accent-emerald-600" />
            Cash on Delivery
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("easypaisaEnabled")} className="h-4 w-4 accent-emerald-600" />
            Easypaisa
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("jazzcashEnabled")} className="h-4 w-4 accent-emerald-600" />
            JazzCash
          </label>
          <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register("bankTransferEnabled")} className="h-4 w-4 accent-emerald-600" />
            Bank transfer
          </label>
        </div>
        <FieldError message={errors.codEnabled?.message} />

        {canEditRestrictedFields ? (
          <div className="grid gap-5 border-t border-slate-200 pt-5 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="settings-payment-easypaisa" className="text-sm font-medium text-slate-700">
                  Easypaisa number
                </label>
                <span className="text-xs text-slate-500">
                  {maskedValueLabel(settings.easypaisaNumber)}
                </span>
              </div>
              <input id="settings-payment-easypaisa" type="text" {...register("easypaisaNumber")} className={inputClassName} placeholder="Leave blank to clear" />
              <FieldError message={errors.easypaisaNumber?.message} />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="settings-payment-jazzcash" className="text-sm font-medium text-slate-700">
                  JazzCash number
                </label>
                <span className="text-xs text-slate-500">
                  {maskedValueLabel(settings.jazzcashNumber)}
                </span>
              </div>
              <input id="settings-payment-jazzcash" type="text" {...register("jazzcashNumber")} className={inputClassName} placeholder="Leave blank to clear" />
              <FieldError message={errors.jazzcashNumber?.message} />
            </div>

            <div>
              <label htmlFor="settings-payment-bank-name" className="text-sm font-medium text-slate-700">
                Bank name
              </label>
              <input id="settings-payment-bank-name" {...register("bankName")} className={inputClassName} />
              <FieldError message={errors.bankName?.message} />
            </div>

            <div>
              <label htmlFor="settings-payment-account-title" className="text-sm font-medium text-slate-700">
                Bank account title
              </label>
              <input id="settings-payment-account-title" {...register("bankAccountTitle")} className={inputClassName} />
              <FieldError message={errors.bankAccountTitle?.message} />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="settings-payment-account-number" className="text-sm font-medium text-slate-700">
                  Bank account number
                </label>
                <span className="text-xs text-slate-500">
                  {maskedValueLabel(settings.bankAccountNumber)}
                </span>
              </div>
              <input id="settings-payment-account-number" type="text" {...register("bankAccountNumber")} className={inputClassName} placeholder="Leave blank to clear" />
              <FieldError message={errors.bankAccountNumber?.message} />
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
            Bank and wallet account details can only be changed by an owner.
          </p>
        )}

        <div>
          <label htmlFor="settings-payment-instructions" className="text-sm font-medium text-slate-700">
            Payment instructions
          </label>
          <textarea id="settings-payment-instructions" rows={4} {...register("paymentInstructions")} className={textareaClassName} placeholder="Tell customers how to complete a prepaid payment" />
          <FieldError message={errors.paymentInstructions?.message} />
        </div>
      </div>
    </FormSection>
  );
}
