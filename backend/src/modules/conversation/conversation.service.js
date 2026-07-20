import * as conversationRepository from "./conversation.repository.js";

import { CONVERSATION_STATE } from "../../constants/conversationStates.js";

export const getConversation = async (customerId) => {
  let conversation = await conversationRepository.getByCustomerId(customerId);

  if (!conversation) {
    conversation = await conversationRepository.create(customerId);
  }

  return conversation;
};

export const setState = async (customerId, state) => {
  return conversationRepository.upsert(customerId, {
    state,
  });
};

export const updateContext = async (customerId, context) => {
  const conversation = await getConversation(customerId);

  return conversationRepository.update(customerId, {
    context: {
      ...(conversation.context || {}),
      ...context,
    },
  });
};

export const resetConversation = async (customerId) => {
  return conversationRepository.update(customerId, {
    state: CONVERSATION_STATE.MAIN_MENU,
    context: {},
  });
};

export const getOrCreateConversation = async (phoneNumber) => {
  let conversation =
    await conversationRepository.findByPhoneNumber(phoneNumber);

  if (!conversation) {
    conversation = await conversationRepository.create(phoneNumber);
  }

  return conversation;
};

export const changeState = async (conversationId, state, context = {}) => {
  return conversationRepository.update(conversationId, {
    state,
    context,
  });
};

export const updateContext = async (conversationId, context) => {
  return conversationRepository.update(conversationId, {
    context,
  });
};
