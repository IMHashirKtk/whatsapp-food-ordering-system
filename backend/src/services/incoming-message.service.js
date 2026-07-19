import * as customerService from "./customer.service.js";
import * as messageService from "./message.service.js";
import * as conversationService from "./conversation.service.js";

export const handleIncomingMessage = async (incomingMessage) => {
  const customer = await customerService.findOrCreateCustomer(
    incomingMessage.whatsappId,
    incomingMessage.customerName,
  );

  await messageService.createIncomingMessage({
    ...incomingMessage,
    customerId: customer.id,
  });

  await conversationService.processConversation(customer, incomingMessage);
};
