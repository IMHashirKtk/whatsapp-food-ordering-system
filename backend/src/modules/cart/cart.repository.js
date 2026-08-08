import prisma from "../../database/prisma.js";

export const getCart = (customerId, restaurantId, db = prisma) => {
  return db.cart.findFirst({
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

const isCartCustomerConflict = (error) => {
  if (error?.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  return (
    (Array.isArray(target) && target.includes("customerId")) ||
    String(target || "").includes("customerId") ||
    String(error.message || "").includes("customerId")
  );
};

export const getOrCreateCart = async (
  customerId,
  restaurantId,
  db = prisma,
) => {
  const customer = await db.customer.findFirst({
    where: {
      id: customerId,
      restaurantId,
    },
    select: { id: true },
  });

  if (!customer) {
    return null;
  }

  try {
    await db.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
    });
  } catch (error) {
    if (!isCartCustomerConflict(error)) {
      throw error;
    }
  }

  return getCart(customerId, restaurantId, db);
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

export const getCartItem = (id, restaurantId) => {
  return prisma.cartItem.findFirst({
    where: {
      id,
      cart: {
        customer: {
          restaurantId,
        },
      },
    },
    include: {
      options: true,
    },
  });
};

export const updateQuantity = async (
  id,
  quantity,
  totalPrice,
  restaurantId,
) => {
  const result = await prisma.cartItem.updateMany({
    where: {
      id,
      cart: {
        customer: {
          restaurantId,
        },
      },
    },
    data: {
      quantity,
      totalPrice,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return prisma.cartItem.findFirst({
    where: { id },
    include: {
      menuItem: true,
      options: true,
    },
  });
};

export const updateCartItemSnapshot = async (
  tx,
  cartItemId,
  { basePrice, totalPrice, options },
) => {
  await tx.cartItem.update({
    where: { id: cartItemId },
    data: {
      basePrice,
      totalPrice,
    },
  });

  await tx.cartItemOption.deleteMany({
    where: { cartItemId },
  });

  if (options.length > 0) {
    await tx.cartItemOption.createMany({
      data: options.map((option) => ({
        cartItemId,
        optionId: option.id,
        name: option.name,
        extraPrice: option.extraPrice,
      })),
    });
  }
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
