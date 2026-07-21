import * as conversationRepository from "./conversation.repository.js";
import { ConversationState } from "./states/state.constants.js";

export const getOrCreateConversation = async (customerId) => {
  let conversation = await conversationRepository.getByCustomerId(customerId);

  if (!conversation) {
    conversation = await conversationRepository.create(customerId);
  }

  return conversation;
};

export const getConversation = async (customerId) => {
  return conversationRepository.getByCustomerId(customerId);
};

export const getConversationById = async (conversationId) => {
  return conversationRepository.getById(conversationId);
};

export const changeState = async (conversationId, state, context = null) => {
  const data = { state };

  if (context !== null) {
    data.context = context;
  }

  return conversationRepository.updateById(conversationId, data);
};

export const setState = async (conversationId, state, context = null) => {
  return changeState(conversationId, state, context);
};

export const updateContext = async (conversationId, context) => {
  const conversation = await conversationRepository.getById(conversationId);

  return conversationRepository.updateById(conversationId, {
    context: {
      ...(conversation.context || {}),
      ...context,
    },
  });
};

export const resetConversation = async (conversationId) => {
  return conversationRepository.updateById(conversationId, {
    state: ConversationState.MAIN_MENU,
    context: {},
  });
};

export const reset = async (conversationId) => {
  return resetConversation(conversationId);
};
