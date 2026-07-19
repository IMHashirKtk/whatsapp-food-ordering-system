import prisma from "../database/prisma.js";
import AppError from "../utils/AppError.js";

export const createCustomer = async (customerData) => {
  // Check if customer already exists
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      whatsappId: customerData.whatsappId,
    },
  });

  if (existingCustomer) {
    throw new AppError("Customer already exists", 409);
  }

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      whatsappId: customerData.whatsappId,
      name: customerData.name,
    },
  });

  return customer;
};

export const getAllCustomers = async () => {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return customers;
};

export const getCustomerById = async (id) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return customer;
};

export const updateCustomer = async (id, updateData) => {
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!existingCustomer) {
    throw new AppError("Customer not found", 404);
  }

  if (
    updateData.whatsappId &&
    updateData.whatsappId !== existingCustomer.whatsappId
  ) {
    const duplicateCustomer = await prisma.customer.findUnique({
      where: {
        whatsappId: updateData.whatsappId,
      },
    });

    if (duplicateCustomer) {
      throw new AppError("WhatsApp ID already exists", 409);
    }
  }

  const updatedCustomer = await prisma.customer.update({
    where: {
      id,
    },
    data: updateData,
  });

  return updatedCustomer;
};

export const deleteCustomer = async (id) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  await prisma.customer.delete({
    where: {
      id,
    },
  });

  return {
    message: "Customer deleted successfully",
  };
};

export const findOrCreateCustomer = async (whatsappId, name) => {
  let customer = await prisma.customer.findUnique({
    where: {
      whatsappId,
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        whatsappId,
        name,
      },
    });

    console.log(
      `✅ New customer created: ${customer.name ?? "Unknown"} (${customer.whatsappId})`,
    );
  } else {
    console.log(
      `👤 Existing customer: ${customer.name ?? "Unknown"} (${customer.whatsappId})`,
    );
  }

  return customer;
};

export const updateState = async (customerId, state) => {
  return prisma.customer.update({
    where: {
      id: customerId,
    },
    data: {
      state,
    },
  });
};
