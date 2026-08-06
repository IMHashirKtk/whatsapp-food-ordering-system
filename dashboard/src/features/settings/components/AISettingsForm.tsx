"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateAISettings } from "../hooks/useUpdateAISettings";
import {
  aiSettingsSchema,
  type AISettingsFormValues,
} from "../schemas/settings.schema";
import type { AISettings } from "../types";
import {
  FormSection,
  normalizeNullable,
  textareaClassName,
} from "./SettingsFormParts";

interface AISettingsFormProps {
  settings: AISettings;
}

const getDefaults = (settings: AISettings): AISettingsFormValues => ({
  aiEnabled: settings.aiEnabled,
  welcomeMessage: settings.welcomeMessage ?? "",
  orderConfirmation: settings.orderConfirmation ?? "",
});

export function AISettingsForm({ settings }: AISettingsFormProps) {
  const mutation = useUpdateAISettings();
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<AISettingsFormValues>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: getDefaults(settings),
  });

  useEffect(() => {
    if (!isDirty) {
      reset(getDefaults(settings));
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: AISettingsFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        aiEnabled: values.aiEnabled,
        welcomeMessage: normalizeNullable(values.welcomeMessage),
        orderConfirmation: normalizeNullable(values.orderConfirmation),
      });
      reset(getDefaults(updated.ai));
      toast.success("AI settings saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save AI settings."),
      );
    }
  };

  return (
    <FormSection
      title="AI messages"
      description="Maintain the configurable messages used by future conversational experiences."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(mutation.error, "Unable to save AI settings.")
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-5">
        <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
          <input type="checkbox" {...register("aiEnabled")} className="h-4 w-4 accent-emerald-600" />
          Enable AI-assisted conversations
        </label>
        <div>
          <label htmlFor="settings-ai-welcome" className="text-sm font-medium text-slate-700">
            Welcome message
          </label>
          <textarea id="settings-ai-welcome" rows={4} {...register("welcomeMessage")} className={textareaClassName} />
        </div>
        <div>
          <label htmlFor="settings-ai-confirmation" className="text-sm font-medium text-slate-700">
            Order confirmation message
          </label>
          <textarea id="settings-ai-confirmation" rows={4} {...register("orderConfirmation")} className={textareaClassName} />
        </div>
      </div>
    </FormSection>
  );
}
