import * as menuService from "../../menu/menu.service.js";
import * as conversationService from "../conversation.service.js";

import { list, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  // Initial entry into the category state
  if (!message.listReply) {
    const categories = await menuService.getActiveCategories();

    if (!categories.length) {
      return sendMessage(text(message.from, "❌ No categories are available."));
    }

    return sendMessage(
      list(message.from, "🍽️ Please choose a category.", "Browse Categories", [
        {
          title: "Categories",
          rows: categories.map((category) => ({
            id: category.id,
            title: category.name,
            description: category.description || "",
          })),
        },
      ]),
    );
  }

  const categoryId = message.listReply.id;
  console.log("Category ID from WhatsApp:", categoryId);
  console.log("Conversation ID:", conversation.id);

  await conversationService.updateContext(conversation.id, {
    categoryId,
  });

  const refreshed = await conversationService.getConversationById(
    conversation.id,
  );

  console.log("Context after save:", refreshed.context);

  await goToState(conversation, ConversationState.ORDERING);
  console.log("Full listReply:", message.listReply);

  return sendMessage(text(message.from, "📋 Loading products..."));
};
