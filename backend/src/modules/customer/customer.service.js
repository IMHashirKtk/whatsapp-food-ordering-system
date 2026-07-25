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

  return customerRepository.create({
    ...data,
    restaurantId,
  });
};

export const getAllCustomers = (restaurantId) =>
  customerRepository.getAll(restaurantId);

export const getCustomer = async (id, restaurantId) => {
  const customer = await customerRepository.getById(id, restaurantId);

  if (!customer) {
    throw new AppError("Customer not found.", 404);
  }

  return customer;
};

export const getCustomerById = getCustomer;

export const updateCustomer = async (id, restaurantId, data) => {
  await getCustomer(id, restaurantId);

  if (data.whatsappId) {
    const existingCustomer = await customerRepository.getByWhatsappId(
      restaurantId,
      data.whatsappId,
    );

    if (existingCustomer && existingCustomer.id !== id) {
      throw new AppError(
        "A customer with this WhatsApp number already exists.",
        409,
      );
    }
  }

  return customerRepository.update(id, restaurantId, data);
};

export const deleteCustomer = async (id, restaurantId) => {
  await getCustomer(id, restaurantId);

  await customerRepository.remove(id, restaurantId);

  return {
    message: "Customer deleted successfully",
  };
};

/* -------------------------------------------------------------------------- */
/*                            Legacy Compatibility                            */
/* -------------------------------------------------------------------------- */

export const updateState = async () => {
  return null;
};
