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
  return prisma.restaurant.findFirst({
    where: {
      settings: {
        metaPhoneNumberId: phoneNumberId,
      },
    },
    include: {
      settings: true,
    },
  });
};
