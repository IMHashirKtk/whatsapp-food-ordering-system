import asyncHandler from "../../utils/async-handler.js";
import { successResponse } from "../../utils/api-response.js";
import * as settingsService from "./settings.service.js";

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings(
    req.user.restaurantId,
    req.user.role,
  );

  return res.status(200).json({
    success: true,
    data: settings,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateProfile(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "Restaurant profile updated successfully.");
});

export const updateOrderConfig = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateOrderConfig(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "Order configuration updated successfully.");
});

export const updatePaymentMethods = asyncHandler(async (req, res) => {
  const settings = await settingsService.updatePaymentMethods(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "Payment methods updated successfully.");
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateAvailability(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "Availability settings updated successfully.");
});

export const updateReceipt = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateReceipt(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "Receipt settings updated successfully.");
});

export const updateNotifications = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateNotifications(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "Notification settings updated successfully.");
});

export const updateLocalization = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateLocalization(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "Localization settings updated successfully.");
});

export const updateAISettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateAISettings(
    req.user.restaurantId,
    req.user.role,
    req.validated.body,
  );

  return successResponse(res, settings, "AI settings updated successfully.");
});

export const updateMetaSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateMetaSettings(
    req.user.restaurantId,
    req.validated.body,
  );

  return successResponse(res, settings, "Meta settings updated successfully.");
});
