import * as conversationRepository from "./conversation.repository.js";

import { ConversationState } from "./states/state.constants.js";

export const getOrCreateConversation = async (customerId) => {
  let conversation = await conversationRepository.getByCustomerId(customerId);

  if (!conversation) {
    conversation = await conversationRepository.create(customerId);
  }

  return conversation;
};

export const changeState = async (conversationId, state, context = null) => {
  const data = { state };

  if (context !== null) {
    data.context = context;
  }

  return conversationRepository.updateById(conversationId, data);
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
    state: CONVERSATION_STATE.MAIN_MENU,
    context: {},
  });
};
