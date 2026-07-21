import prisma from "../../database/prisma.js";

export const getCart = (customerId) => {
  return prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          menuItem: true,
          options: true,
        },
      },
    },
  });
};

export const createCart = (customerId) => {
  return prisma.cart.create({
    data: {
      customerId,
    },
  });
};

export const getOrCreateCart = async (customerId) => {
  let cart = await getCart(customerId);

  if (!cart) {
    await createCart(customerId);
    cart = await getCart(customerId);
  }

  return cart;
};

export const addItem = (tx, data) => {
  return tx.cartItem.create({
    data,
  });
};

export const addItemOption = (tx, data) => {
  return tx.cartItemOption.create({
    data,
  });
};

export const removeItem = (id) => {
  return prisma.cartItem.delete({
    where: {
      id,
    },
  });
};

export const clearCart = (cartId) => {
  return prisma.cartItem.deleteMany({
    where: {
      cartId,
    },
  });
};

export const transaction = (callback) => {
  return prisma.$transaction(callback);
};

export const clearCartTx = async (tx, cartId) => {
  await tx.cartItemOption.deleteMany({
    where: {
      cartItem: {
        cartId,
      },
    },
  });

  await tx.cartItem.deleteMany({
    where: {
      cartId,
    },
  });
};
