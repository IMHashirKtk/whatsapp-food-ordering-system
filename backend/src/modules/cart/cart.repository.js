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
    data: { customerId },
  });
};

export const getOrCreateCart = async (customerId) => {
  let cart = await getCart(customerId);

  if (!cart) {
    cart = await createCart(customerId);
    cart = await getCart(customerId);
  }

  return cart;
};

export const addItem = (data, db = prisma) => {
  return db.cartItem.create({
    data,
  });
};

export const addItemOption = (data, db = prisma) => {
  return db.cartItemOption.create({
    data,
  });
};

export const updateItemQuantity = (id, quantity, db = prisma) => {
  return db.cartItem.update({
    where: { id },
    data: { quantity },
  });
};

export const removeItem = (id, db = prisma) => {
  return db.cartItem.delete({
    where: { id },
  });
};

export const clearCart = (cartId, db = prisma) => {
  return db.cartItem.deleteMany({
    where: { cartId },
  });
};
