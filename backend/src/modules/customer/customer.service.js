import * as customerRepository from "./customer.repository.js";

/* -------------------------------------------------------------------------- */
/*                                WhatsApp Flow                               */
/* -------------------------------------------------------------------------- */

export const getOrCreateCustomer = async (whatsappId, profileName) => {
  let customer = await customerRepository.getByWhatsappId(whatsappId);

  if (!customer) {
    return customerRepository.create({
      whatsappId,
      name: profileName,
    });
  }

  if (profileName && profileName !== customer.name) {
    customer = await customerRepository.update(customer.id, {
      name: profileName,
    });
  }

  return customer;
};

export const findOrCreateCustomer = getOrCreateCustomer;

/* -------------------------------------------------------------------------- */
/*                                   CRUD                                     */
/* -------------------------------------------------------------------------- */

export const createCustomer = (data) => customerRepository.create(data);

export const getAllCustomers = () => customerRepository.getAll();

export const getCustomer = (id) => customerRepository.getById(id);

export const getCustomerById = getCustomer;

export const updateCustomer = (id, data) => customerRepository.update(id, data);

export const deleteCustomer = async (id) => {
  await customerRepository.remove(id);

  return {
    message: "Customer deleted successfully",
  };
};

/* -------------------------------------------------------------------------- */
/*                            Legacy Compatibility                            */
/* -------------------------------------------------------------------------- */

export const updateState = async () => {
  // Customer state is now stored in Conversation.
  return null;
};
