import env from "../../config/env.js";
import AppError from "../../utils/AppError.js";
import * as conversationService from "../conversation/conversation.service.js";
import * as customerService from "../customer/customer.service.js";
import * as restaurantService from "../restaurant/restaurant.service.js";
import { text } from "./message.factory.js";
import * as metaRepository from "./meta.repository.js";
import { isValidMetaSignature } from "./meta.signature.js";
import {
  getWebhookPhoneNumberIds,
  parseWebhooks,
} from "./webhook.parser.js";
import { sendMessage } from "./meta.api.js";
import { getOrderStatusNotificationMessage } from "./meta.templates.js";

const getMessageContent = (message) =>
  message.text ?? message.buttonReply?.id ?? message.listReply?.id ?? null;

const getVerificationSecret = async (payload) => {
  if (env.meta.appSecret) {
    return env.meta.appSecret;
  }

  const phoneNumberIds = [
    ...new Set(
      getWebhookPhoneNumberIds(payload).filter(
        (phoneNumberId) =>
          typeof phoneNumberId === "string" && phoneNumberId.trim(),
      ),
    ),
  ];

  if (phoneNumberIds.length === 0) {
    return null;
  }

  const restaurants = await Promise.all(
    phoneNumberIds.map((phoneNumberId) =>
      restaurantService.findRestaurantByMetaPhoneNumberId(phoneNumberId),
    ),
  );

  if (restaurants.some((restaurant) => !restaurant)) {
    return null;
  }

  const secrets = [
    ...new Set(
      restaurants
        .map((restaurant) => restaurant.settings?.webhookSecret?.trim())
        .filter(Boolean),
    ),
  ];

  return secrets.length === 1 ? secrets[0] : null;
};

export const verifyWebhookRequest = async ({
  payload,
  rawBody,
  signature,
}) => {
  const secret = await getVerificationSecret(payload);

  if (!secret) {
    throw new AppError("Webhook authentication is unavailable.", 503);
  }

  if (!isValidMetaSignature(rawBody, signature, secret)) {
    throw new AppError("Invalid webhook signature.", 403);
  }
};

const processMessage = async (message) => {
  if (
    typeof message.phoneNumberId !== "string" ||
    !message.phoneNumberId.trim()
  ) {
    return { status: "IGNORED_MISSING_TENANT" };
  }

  const restaurant = await restaurantService.findRestaurantByMetaPhoneNumberId(
    message.phoneNumberId,
  );

  if (!restaurant) {
    return { status: "IGNORED_UNKNOWN_TENANT" };
  }

  const claim = await metaRepository.claimIncomingMessage({
    metaMessageId: message.messageId,
    type: message.messageType,
    content: getMessageContent(message),
  });

  if (claim.status !== "CLAIMED") {
    return claim;
  }

  try {
    const customer = await customerService.getOrCreateCustomer(
      restaurant.id,
      message.from,
      message.profileName,
    );

    const attached = await metaRepository.attachCustomer(
      claim.messageId,
      claim.processingToken,
      customer.id,
    );

    if (attached.count !== 1) {
      return { status: "CLAIM_LOST" };
    }

    const conversation = await conversationService.getOrCreateConversation(
      customer.id,
      restaurant.id,
    );

    const { dispatch } = await import("../conversation/engine/dispatcher.js");

    await dispatch(conversation, message);
    const completed = await metaRepository.completeMessage(
      claim.messageId,
      claim.processingToken,
    );

    if (completed.count !== 1) {
      throw new Error("Message claim was lost before completion.");
    }

    return { status: "PROCESSED" };
  } catch (error) {
    try {
      await metaRepository.failMessage(
        claim.messageId,
        claim.processingToken,
      );
    } catch (claimError) {
      console.error("[MetaWebhook] Failed to release message claim.", {
        messageId: message.messageId,
        error: claimError?.message,
      });
    }

    console.error("[MetaWebhook] Message processing failed.", {
      messageId: message.messageId,
      error: error?.message,
    });
    throw error;
  }
};

export const processWebhook = async (payload) => {
  const messages = parseWebhooks(payload);
  const failures = [];

  for (const message of messages) {
    try {
      await processMessage(message);
    } catch (error) {
      failures.push(error);
    }
  }

  if (failures.length > 0) {
    throw failures[0];
  }

  return { processed: messages.length };
};

export const sendOrderStatusNotification = async ({
  restaurantId,
  to,
  status,
  orderNumber,
  restaurantName,
  cancellationReason,
}) => {
  const message = getOrderStatusNotificationMessage({
    status,
    orderNumber,
    restaurantName,
    cancellationReason,
  });

  if (!message) {
    return null;
  }

  if (!to) {
    throw new Error("Customer WhatsApp number is missing.");
  }

  return sendMessage(restaurantId, text(to, message));
};
