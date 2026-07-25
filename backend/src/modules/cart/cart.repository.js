import prisma from "../../database/prisma.js";

export const getCart = (customerId, restaurantId) => {
  return prisma.cart.findFirst({
    where: {
      customerId,
      customer: {
        restaurantId,
      },
    },
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

export const getOrCreateCart = async (customerId, restaurantId) => {
  let cart = await getCart(customerId, restaurantId);

  if (!cart) {
    await createCart(customerId);
    cart = await getCart(customerId, restaurantId);
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

export const removeItem = (id, restaurantId) => {
  return prisma.cartItem.deleteMany({
    where: {
      id,
      cart: {
        customer: {
          restaurantId,
        },
      },
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
