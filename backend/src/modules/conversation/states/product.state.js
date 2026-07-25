import * as menuService from "../../menu/menu.service.js";
import * as conversationService from "../conversation.service.js";

import { list, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

import * as productOptionsState from "./product-options.state.js";

export const handle = async (conversation, message) => {
  console.log(">>> ENTERED PRODUCT STATE");

  conversation = await conversationService.getConversationById(conversation.id);

  console.log("Conversation:", {
    id: conversation.id,
    state: conversation.state,
    context: conversation.context,
  });

  const { categoryId } = conversation.context || {};

  if (!categoryId) {
    return sendMessage(
      conversation.restaurantId,
      text(
        message.from,
        "❌ Category not found. Please start your order again.",
      ),
    );
  }

  // First entry into PRODUCT state
  if (!message.listReply) {
    const products = await menuService.getMenuItemsByCategory(
      categoryId,
      conversation.restaurantId,
    );

    if (!products.length) {
      return sendMessage(
        conversation.restaurantId,
        text(message.from, "❌ No products are available in this category."),
      );
    }

    return sendMessage(
      conversation.restaurantId,
      list(message.from, "🍴 Please choose a product.", "Browse Products", [
        {
          title: "Products",
          rows: products.map((product) => ({
            id: product.id,
            title: product.name,
            description: `Rs. ${product.basePrice}`,
          })),
        },
      ]),
    );
  }

  // Product selected
  await conversationService.updateContext(conversation.id, {
    menuItemId: message.listReply.id,
    optionGroupIndex: 0,
    selectedOptions: [],
    quantity: 1,
  });

  await goToState(conversation, ConversationState.SELECTING_OPTIONS);

  const updatedConversation = await conversationService.getOrCreateConversation(
    conversation.customerId,
    conversation.restaurantId,
  );

  return productOptionsState.handle(updatedConversation, message);
};
