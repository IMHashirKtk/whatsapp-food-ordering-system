import * as menuService from "../../menu/menu.service.js";
import * as conversationService from "../conversation.service.js";

import { list, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

import * as productOptionsState from "./product-options.state.js";
import * as categoryState from "./category.state.js";

export const handle = async (conversation, message) => {
  conversation = await conversationService.getConversationById(conversation.id);

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
      await goToState(conversation, ConversationState.VIEWING_MENU);
      await sendMessage(
        conversation.restaurantId,
        text(
          message.from,
          "No products are currently available in that category. Please choose another category.",
        ),
      );

      return categoryState.handle(conversation, {
        ...message,
        buttonReply: null,
        listReply: null,
      });
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
