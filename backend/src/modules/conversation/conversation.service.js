import * as conversationRepository from "./conversation.repository.js";
import { ConversationState } from "./states/state.constants.js";

export const getOrCreateConversation = async (customerId, restaurantId) => {
  let conversation = await conversationRepository.getByCustomerId(customerId);

  if (!conversation) {
    conversation = await conversationRepository.create(
      customerId,
      restaurantId,
    );
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

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  return conversationRepository.updateById(conversationId, {
    context: {
      ...(conversation.context || {}),
      ...context,
    },
  });
};

export const setPaymentMethod = async (conversationId, paymentMethod) => {
  return updateContext(conversationId, {
    paymentMethod,
  });
};

export const pushNavigation = async (conversationId) => {
  const conversation = await conversationRepository.getById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const context = conversation.context || {};

  const history = context.navigation?.history || [];

  const snapshot = {
    state: conversation.state,
    context: JSON.parse(JSON.stringify(context)),
  };

  // Prevent recursive history
  delete snapshot.context.navigation;

  history.push(snapshot);

  return conversationRepository.updateById(conversationId, {
    context: {
      ...context,
      navigation: {
        history,
      },
    },
  });
};

export const popNavigation = async (conversationId) => {
  const conversation = await conversationRepository.getById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const context = conversation.context || {};

  const history = context.navigation?.history || [];

  if (history.length === 0) {
    return null;
  }

  const previous = history.pop();

  await conversationRepository.updateById(conversationId, {
    state: previous.state,
    context: previous.context,
  });

  return previous;
};

export const resetConversation = async (conversationId) => {
  return conversationRepository.updateById(conversationId, {
    state: ConversationState.MAIN_MENU,
    context: {},
  });
};

export const continueNavigation = async (conversationId) => {
  return popNavigation(conversationId);
};

export const reset = async (conversationId) => {
  return resetConversation(conversationId);
};
