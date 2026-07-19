import prisma from "../database/prisma.js";

export const createIncomingMessage = async (message) => {
  return prisma.message.create({
    data: {
      customerId: message.customerId,
      metaMessageId: message.messageId,
      direction: "INCOMING",
      type: message.messageType.toUpperCase(),
      content: message.text,
    },
  });
};
