"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateLocalization } from "../hooks/useUpdateLocalization";
import {
  localizationSchema,
  type LocalizationFormValues,
} from "../schemas/settings.schema";
import type { LocalizationSettings } from "../types";
import { FieldError, FormSection, inputClassName } from "./SettingsFormParts";

interface LocalizationFormProps {
  settings: LocalizationSettings;
}

const getDefaults = (
  settings: LocalizationSettings,
): LocalizationFormValues => ({
  language: settings.language,
  timezone: settings.timezone,
  currencySymbol: settings.currencySymbol,
});

export function LocalizationForm({ settings }: LocalizationFormProps) {
  const mutation = useUpdateLocalization();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<LocalizationFormValues>({
    resolver: zodResolver(localizationSchema),
    defaultValues: getDefaults(settings),
  });

  useEffect(() => {
    if (!isDirty) {
      reset(getDefaults(settings));
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: LocalizationFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        language: values.language.trim(),
        timezone: values.timezone.trim(),
        currencySymbol: values.currencySymbol.trim(),
      });
      reset(getDefaults(updated.localization));
      toast.success("Localization settings saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save localization settings."),
      );
    }
  };

  return (
    <FormSection
      title="Localization"
      description="Set the language, timezone, and currency symbol shown across future dashboard experiences."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save localization settings.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="settings-localization-language" className="text-sm font-medium text-foreground">
            Language code
          </label>
          <input id="settings-localization-language" maxLength={10} {...register("language")} className={inputClassName} />
          <FieldError message={errors.language?.message} />
        </div>
        <div>
          <label htmlFor="settings-localization-timezone" className="text-sm font-medium text-foreground">
            Timezone
          </label>
          <input id="settings-localization-timezone" maxLength={100} {...register("timezone")} className={inputClassName} />
          <FieldError message={errors.timezone?.message} />
        </div>
        <div>
          <label htmlFor="settings-localization-symbol" className="text-sm font-medium text-foreground">
            Currency symbol
          </label>
          <input id="settings-localization-symbol" maxLength={10} {...register("currencySymbol")} className={inputClassName} />
          <FieldError message={errors.currencySymbol?.message} />
        </div>
      </div>
    </FormSection>
  );
}
