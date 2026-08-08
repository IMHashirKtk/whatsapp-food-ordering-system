import prisma from "../../database/prisma.js";

export const getById = (id) => {
  return prisma.restaurant.findUnique({
    where: { id },
    include: {
      settings: true,
    },
  });
};

export const getByMetaPhoneNumberId = (phoneNumberId) => {
  if (typeof phoneNumberId !== "string" || !phoneNumberId.trim()) {
    return Promise.resolve(null);
  }

  return prisma.restaurant.findFirst({
    where: {
      settings: { metaPhoneNumberId: phoneNumberId.trim() },
    },
    include: {
      settings: true,
    },
  });
};
