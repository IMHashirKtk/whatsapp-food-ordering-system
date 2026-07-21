import * as customerRepository from "./customer.repository.js";

export const getOrCreateCustomer = async (whatsappId, profileName) => {
  let customer = await customerRepository.getByWhatsappId(whatsappId);

  if (!customer) {
    customer = await customerRepository.create({
      whatsappId,
      name: profileName,
    });

    return customer;
  }

  if (profileName && profileName !== customer.name) {
    customer = await customerRepository.update(customer.id, {
      name: profileName,
    });
  }

  return customer;
};

export const getCustomer = (id) => {
  return customerRepository.getById(id);
};
