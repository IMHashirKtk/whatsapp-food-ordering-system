"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getSettingsErrorMessage } from "../services/settings.service";
import { useUpdateProfileSettings } from "../hooks/useUpdateProfileSettings";
import {
  profileSettingsSchema,
  type ProfileSettingsFormValues,
} from "../schemas/settings.schema";
import type { RestaurantSettingsProfile } from "../types";
import {
  FieldError,
  FormSection,
  inputClassName,
  normalizeNullable,
  textareaClassName,
} from "./SettingsFormParts";

interface ProfileSettingsFormProps {
  settings: RestaurantSettingsProfile;
}

const getDefaults = (
  settings: RestaurantSettingsProfile,
): ProfileSettingsFormValues => ({
  name: settings.name,
  description: settings.description ?? "",
  imageUrl: settings.imageUrl ?? "",
  address: settings.address ?? "",
  phone: settings.phone ?? "",
  whatsappNumber: settings.whatsappNumber ?? "",
  email: settings.email ?? "",
  currency: settings.currency,
  taxRate: settings.taxRate,
  deliveryFee: settings.deliveryFee,
  openingTime: settings.openingTime ?? "",
  closingTime: settings.closingTime ?? "",
  isOpen: settings.isOpen,
});

export function ProfileSettingsForm({ settings }: ProfileSettingsFormProps) {
  const mutation = useUpdateProfileSettings();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: getDefaults(settings),
  });

  useEffect(() => {
    if (!isDirty) {
      reset(getDefaults(settings));
    }
  }, [isDirty, reset, settings]);

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    try {
      const updated = await mutation.mutateAsync({
        name: values.name.trim(),
        description: normalizeNullable(values.description),
        imageUrl: normalizeNullable(values.imageUrl),
        address: normalizeNullable(values.address),
        phone: normalizeNullable(values.phone),
        whatsappNumber: normalizeNullable(values.whatsappNumber),
        email: normalizeNullable(values.email),
        currency: values.currency.trim(),
        taxRate: values.taxRate,
        deliveryFee: values.deliveryFee,
        openingTime: normalizeNullable(values.openingTime),
        closingTime: normalizeNullable(values.closingTime),
        isOpen: values.isOpen,
      });

      reset(getDefaults(updated.restaurant));
      toast.success("Restaurant profile saved.");
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, "Unable to save the restaurant profile."),
      );
    }
  };

  return (
    <FormSection
      title="Restaurant profile"
      description="Keep the identity and customer-facing contact details current."
      isDirty={isDirty}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      errorMessage={
        mutation.isError
          ? getSettingsErrorMessage(
              mutation.error,
              "Unable to save the restaurant profile.",
            )
          : undefined
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="settings-profile-name" className="text-sm font-medium text-foreground">
            Restaurant name
          </label>
          <input id="settings-profile-name" {...register("name")} className={inputClassName} />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="settings-profile-description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea id="settings-profile-description" rows={3} {...register("description")} className={textareaClassName} />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="settings-profile-image" className="text-sm font-medium text-foreground">
            Logo URL
          </label>
          <input id="settings-profile-image" type="text" placeholder="https://example.com/logo.png" {...register("imageUrl")} className={inputClassName} />
          <FieldError message={errors.imageUrl?.message} />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="settings-profile-address" className="text-sm font-medium text-foreground">
            Address
          </label>
          <textarea id="settings-profile-address" rows={2} {...register("address")} className={textareaClassName} />
          <FieldError message={errors.address?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-phone" className="text-sm font-medium text-foreground">
            Phone
          </label>
          <input id="settings-profile-phone" type="tel" placeholder="+923001234567" {...register("phone")} className={inputClassName} />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-whatsapp" className="text-sm font-medium text-foreground">
            WhatsApp number
          </label>
          <input id="settings-profile-whatsapp" type="tel" placeholder="+923001234567" {...register("whatsappNumber")} className={inputClassName} />
          <FieldError message={errors.whatsappNumber?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input id="settings-profile-email" type="email" {...register("email")} className={inputClassName} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-currency" className="text-sm font-medium text-foreground">
            Currency code
          </label>
          <input id="settings-profile-currency" maxLength={10} {...register("currency")} className={inputClassName} />
          <FieldError message={errors.currency?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-tax" className="text-sm font-medium text-foreground">
            Tax percentage
          </label>
          <input id="settings-profile-tax" type="number" min={0} max={100} step="0.01" {...register("taxRate", { valueAsNumber: true })} className={inputClassName} />
          <FieldError message={errors.taxRate?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-delivery" className="text-sm font-medium text-foreground">
            Delivery fee
          </label>
          <input id="settings-profile-delivery" type="number" min={0} step="0.01" {...register("deliveryFee", { valueAsNumber: true })} className={inputClassName} />
          <FieldError message={errors.deliveryFee?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-opening" className="text-sm font-medium text-foreground">
            Opening time
          </label>
          <input id="settings-profile-opening" type="time" {...register("openingTime")} className={inputClassName} />
          <FieldError message={errors.openingTime?.message} />
        </div>

        <div>
          <label htmlFor="settings-profile-closing" className="text-sm font-medium text-foreground">
            Closing time
          </label>
          <input id="settings-profile-closing" type="time" {...register("closingTime")} className={inputClassName} />
          <FieldError message={errors.closingTime?.message} />
        </div>

        <label className="flex min-h-10 items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground md:col-span-2">
          <input type="checkbox" {...register("isOpen")} className="h-4 w-4 accent-primary" />
          Restaurant is open
        </label>
      </div>
    </FormSection>
  );
}
