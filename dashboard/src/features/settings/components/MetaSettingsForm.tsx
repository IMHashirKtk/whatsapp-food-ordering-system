"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateMetaSettings } from "../hooks/useUpdateMetaSettings";
import {
  metaSettingsSchema,
  type MetaSettingsFormValues,
} from "../schemas/settings.schema";
import type { MetaSettings } from "../types";
import {
  FieldError,
  FormSection,
  inputClassName,
  isMaskedPlaceholder,
  normalizeNullable,
} from "./SettingsFormParts";

interface MetaSettingsFormProps {
  settings: MetaSettings;
}

const getDefaults = (settings: MetaSettings): MetaSettingsFormValues => ({
  metaPhoneNumberId: settings.metaPhoneNumberId ?? "",
  metaDisplayPhone: settings.metaDisplayPhone ?? "",
  metaBusinessAccountId: settings.metaBusinessAccountId ?? "",
  metaAccessToken: settings.metaAccessToken.masked ?? "",
  metaVerifyToken: settings.metaVerifyToken.masked ?? "",
  webhookSecret: settings.webhookSecret.masked ?? "",
});

const buildSecretValue = (
  value: string,
  initialValue: string,
): string | null | undefined => {
  if (value === initialValue && isMaskedPlaceholder(initialValue)) {
    return undefined;
  }

  if (value === initialValue && !value) {
    return undefined;
  }

  return normalizeNullable(value);
};

export function MetaSettingsForm({ settings }: MetaSettingsFormProps) {
  const mutation = useUpdateMetaSettings();
  const defaultsRef = useRef(getDefaults(settings));
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MetaSettingsFormValues>({
    resolver: zodResolver(metaSettingsSchema),
    defaultValues: defaultsRef.current,
  });

  useEffect(() => {
    if (!isDirty) {
      const nextDefaults = getDefaults(settings);
      defaultsRef.current = nextDefaults;
      reset(nextDefaults);
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: MetaSettingsFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        metaPhoneNumberId:
          values.metaPhoneNumberId === defaultsRef.current.metaPhoneNumberId
            ? undefined
            : normalizeNullable(values.metaPhoneNumberId),
        metaDisplayPhone:
          values.metaDisplayPhone === defaultsRef.current.metaDisplayPhone
            ? undefined
            : normalizeNullable(values.metaDisplayPhone),
        metaBusinessAccountId:
          values.metaBusinessAccountId ===
          defaultsRef.current.metaBusinessAccountId
            ? undefined
            : normalizeNullable(values.metaBusinessAccountId),
        metaAccessToken: buildSecretValue(
          values.metaAccessToken,
          defaultsRef.current.metaAccessToken,
        ),
        metaVerifyToken: buildSecretValue(
          values.metaVerifyToken,
          defaultsRef.current.metaVerifyToken,
        ),
        webhookSecret: buildSecretValue(
          values.webhookSecret,
          defaultsRef.current.webhookSecret,
        ),
      });

      const nextDefaults = {
        metaPhoneNumberId: updated.metaPhoneNumberId ?? "",
        metaDisplayPhone: updated.metaDisplayPhone ?? "",
        metaBusinessAccountId: updated.metaBusinessAccountId ?? "",
        metaAccessToken: updated.metaAccessToken.masked ?? "",
        metaVerifyToken: updated.metaVerifyToken.masked ?? "",
        webhookSecret: updated.webhookSecret.masked ?? "",
      };
      defaultsRef.current = nextDefaults;
      reset(nextDefaults);
      toast.success("Meta settings saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save Meta settings."),
      );
    }
  };

  return (
    <FormSection
      title="Meta integration"
      description="Manage WhatsApp Cloud API identifiers and credentials. Existing secrets stay masked."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save Meta settings.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="settings-meta-phone-id" className="text-sm font-medium text-foreground">
            Meta phone number ID
          </label>
          <input id="settings-meta-phone-id" {...register("metaPhoneNumberId")} className={inputClassName} />
          <FieldError message={errors.metaPhoneNumberId?.message} />
        </div>
        <div>
          <label htmlFor="settings-meta-display-phone" className="text-sm font-medium text-foreground">
            Display phone
          </label>
          <input id="settings-meta-display-phone" type="tel" {...register("metaDisplayPhone")} className={inputClassName} />
          <FieldError message={errors.metaDisplayPhone?.message} />
        </div>
        <div>
          <label htmlFor="settings-meta-business-id" className="text-sm font-medium text-foreground">
            Business account ID
          </label>
          <input id="settings-meta-business-id" {...register("metaBusinessAccountId")} className={inputClassName} />
          <FieldError message={errors.metaBusinessAccountId?.message} />
        </div>

        <div className="rounded-md border border-warning/25 bg-warning/10 p-3 text-sm leading-6 text-warning md:col-span-2">
          Secret fields are masked by the server. Leave a masked field unchanged to preserve it, enter a new value to replace it, or clear it to remove it.
        </div>

        <SecretField
          id="settings-meta-access-token"
          label="Access token"
          value={settings.metaAccessToken}
          register={register("metaAccessToken")}
          error={errors.metaAccessToken?.message}
        />
        <SecretField
          id="settings-meta-verify-token"
          label="Verify token"
          value={settings.metaVerifyToken}
          register={register("metaVerifyToken")}
          error={errors.metaVerifyToken?.message}
        />
        <SecretField
          id="settings-meta-webhook-secret"
          label="Webhook secret"
          value={settings.webhookSecret}
          register={register("webhookSecret")}
          error={errors.webhookSecret?.message}
        />
      </div>
    </FormSection>
  );
}

interface SecretFieldProps {
  id: string;
  label: string;
  value: MetaSettings["metaAccessToken"];
  register: UseFormRegisterReturn;
  error?: string;
}

function SecretField({ id, label, value, register, error }: SecretFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
          <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
          <span className="text-xs text-muted-foreground">
          {value.hasValue ? `Configured${value.masked ? ` (${value.masked})` : ""}` : "Not configured"}
        </span>
      </div>
      <input id={id} type="text" autoComplete="off" {...register} className={inputClassName} />
      <FieldError message={error} />
    </div>
  );
}
