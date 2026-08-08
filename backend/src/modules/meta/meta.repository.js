import { randomUUID } from "node:crypto";

import prisma from "../../database/prisma.js";

const MESSAGE_PROCESSING_LEASE_MS = 5 * 60 * 1000;

const isUniqueViolation = (error, field) => {
  if (error?.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  return Array.isArray(target)
    ? target.includes(field)
    : String(target || "").includes(field);
};

const getExistingMessage = (metaMessageId, db) =>
  db.message.findUnique({
    where: { metaMessageId },
    select: {
      id: true,
      processingStatus: true,
      processingStartedAt: true,
    },
  });

export const claimIncomingMessage = async (
  { metaMessageId, type, content },
  db = prisma,
) => {
  const processingToken = randomUUID();
  const now = new Date();

  try {
    const message = await db.message.create({
      data: {
        metaMessageId,
        direction: "INCOMING",
        type,
        content,
        processingStatus: "PROCESSING",
        processingStartedAt: now,
        processingToken,
      },
      select: { id: true },
    });

    return {
      status: "CLAIMED",
      messageId: message.id,
      processingToken,
    };
  } catch (error) {
    if (!isUniqueViolation(error, "metaMessageId")) {
      throw error;
    }
  }

  const existing = await getExistingMessage(metaMessageId, db);

  if (!existing) {
    return claimIncomingMessage({ metaMessageId, type, content }, db);
  }

  if (existing.processingStatus === "COMPLETED") {
    return { status: "DUPLICATE_COMPLETED" };
  }

  const leaseExpired =
    existing.processingStartedAt.getTime() + MESSAGE_PROCESSING_LEASE_MS <=
    Date.now();

  if (existing.processingStatus === "PROCESSING" && !leaseExpired) {
    return { status: "DUPLICATE_IN_PROGRESS" };
  }

  const takeover = await db.message.updateMany({
    where: {
      metaMessageId,
      OR: [
        { processingStatus: "FAILED" },
        {
          processingStatus: "PROCESSING",
          processingStartedAt: {
            lt: new Date(Date.now() - MESSAGE_PROCESSING_LEASE_MS),
          },
        },
      ],
    },
    data: {
      customerId: null,
      processingStatus: "PROCESSING",
      processingStartedAt: now,
      processingToken,
      processedAt: null,
    },
  });

  if (takeover.count === 1) {
    const message = await db.message.findUnique({
      where: { metaMessageId },
      select: { id: true },
    });

    return {
      status: "CLAIMED",
      messageId: message.id,
      processingToken,
    };
  }

  return { status: "DUPLICATE_IN_PROGRESS" };
};

export const attachCustomer = (
  messageId,
  processingToken,
  customerId,
  db = prisma,
) =>
  db.message.updateMany({
    where: {
      id: messageId,
      processingToken,
      processingStatus: "PROCESSING",
    },
    data: { customerId },
  });

export const completeMessage = (messageId, processingToken, db = prisma) =>
  db.message.updateMany({
    where: {
      id: messageId,
      processingToken,
      processingStatus: "PROCESSING",
    },
    data: {
      processingStatus: "COMPLETED",
      processedAt: new Date(),
      processingToken: null,
    },
  });

export const failMessage = (messageId, processingToken, db = prisma) =>
  db.message.updateMany({
    where: {
      id: messageId,
      processingToken,
      processingStatus: "PROCESSING",
    },
    data: {
      processingStatus: "FAILED",
      processingToken: null,
    },
  });
