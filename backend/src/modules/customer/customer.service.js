import * as customerRepository from "./customer.repository.js";
import AppError from "../../utils/AppError.js";

/* -------------------------------------------------------------------------- */
/*                                WhatsApp Flow                               */
/* -------------------------------------------------------------------------- */

export const getOrCreateCustomer = async (
  restaurantId,
  whatsappId,
  profileName,
) => {
  let customer = await customerRepository.getByWhatsappId(
    restaurantId,
    whatsappId,
  );

  if (!customer) {
    return customerRepository.create({
      restaurantId,
      whatsappId,
      name: profileName,
    });
  }

  if (profileName && profileName !== customer.name) {
    customer = await customerRepository.update(customer.id, restaurantId, {
      name: profileName,
    });
  }

  return customer;
};

export const findOrCreateCustomer = getOrCreateCustomer;

/* -------------------------------------------------------------------------- */
/*                                   CRUD                                     */
/* -------------------------------------------------------------------------- */

export const createCustomer = async (restaurantId, data) => {
  const existingCustomer = await customerRepository.getByWhatsappId(
    restaurantId,
    data.whatsappId,
  );

  if (existingCustomer) {
    throw new AppError(
      "A customer with this WhatsApp number already exists.",
      409,
    );
  }

  try {
    return await customerRepository.create({
      ...data,
      restaurantId,
    });
  } catch (error) {
    if (isWhatsappConflict(error)) {
      throw duplicateWhatsappError();
    }

    throw error;
  }
};

const isWhatsappConflict = (error) => {
  if (error?.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  return Array.isArray(target)
    ? target.includes("whatsappId")
    : String(target || "").includes("whatsappId");
};

const duplicateWhatsappError = () =>
  new AppError(
    "A customer with this WhatsApp number already exists.",
    409,
  );

export const getAllCustomers = async (restaurantId, query = {}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const search = query.search;

  const [customers, total] = await Promise.all([
    customerRepository.getPage({ restaurantId, page, limit, search }),
    customerRepository.count({ restaurantId, search }),
  ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomer = async (id, restaurantId) => {
  const customer = await customerRepository.getById(id, restaurantId);

  if (!customer) {
    throw new AppError("Customer not found.", 404);
  }

  return customer;
};

export const getCustomerById = getCustomer;

export const getCustomerDetails = async (id, restaurantId) => {
  const customer = await customerRepository.getDetailById(id, restaurantId);

  if (!customer) {
    throw new AppError("Customer not found.", 404);
  }

  const summary = await customerRepository.getOrderSummary(id, restaurantId);

  return {
    customer,
    summary,
  };
};

export const updateCustomer = async (id, restaurantId, data) => {
  await getCustomer(id, restaurantId);

  if (data.whatsappId) {
    const existingCustomer = await customerRepository.getByWhatsappId(
      restaurantId,
      data.whatsappId,
    );

    if (existingCustomer && existingCustomer.id !== id) {
      throw duplicateWhatsappError();
    }
  }

  try {
    return await customerRepository.update(id, restaurantId, data);
  } catch (error) {
    if (isWhatsappConflict(error)) {
      throw duplicateWhatsappError();
    }

    throw error;
  }
};

export const deleteCustomer = async (id, restaurantId) => {
  await getCustomer(id, restaurantId);

  await customerRepository.remove(id, restaurantId);

  return {
    message: "Customer deleted successfully",
  };
};

export const updateAddress = async (id, restaurantId, address) => {
  await getCustomer(id, restaurantId);

  return customerRepository.update(id, restaurantId, {
    address,
  });
};

/* -------------------------------------------------------------------------- */
/*                            Legacy Compatibility                            */
/* -------------------------------------------------------------------------- */

export const updateState = async () => {
  return null;
};
