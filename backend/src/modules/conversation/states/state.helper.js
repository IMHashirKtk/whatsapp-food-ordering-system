import * as conversationService from "../conversation.service.js";

export const goToState = (conversation, state, context = null) => {
  return conversationService.changeState(conversation.id, state, context);
};

export const saveContext = (conversation, context) => {
  return conversationService.updateContext(conversation.id, context);
};
