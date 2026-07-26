import asyncHandler from "../../utils/async-handler.js";
import * as settingsService from "./settings.service.js";

/* ==========================
   Get Settings
========================== */

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings(req.user.restaurantId);

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/* ==========================
   Update General Settings
========================== */

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(
    req.user.restaurantId,
    req.validated.body,
  );

  res.status(200).json({
    success: true,
    message: "Settings updated successfully.",
    data: settings,
  });
});

/* ==========================
   Update Meta Settings
========================== */

export const updateMetaSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateMetaSettings(
    req.user.restaurantId,
    req.validated.body,
  );

  res.status(200).json({
    success: true,
    message: "Meta settings updated successfully.",
    data: settings,
  });
});

/* ==========================
   Update AI Settings
========================== */

export const updateAISettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateAISettings(
    req.user.restaurantId,
    req.validated.body,
  );

  successResponse(res, settings, "Settings updated successfully.");
});
