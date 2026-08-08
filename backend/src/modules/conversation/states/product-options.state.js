import * as menuService from "../../menu/menu.service.js";
import * as conversationService from "../conversation.service.js";
import { MAX_CART_QUANTITY } from "../../cart/cart.rules.js";

import { list, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";
import * as categoryState from "./category.state.js";

export const handle = async (conversation, message) => {
  console.log(">>> ENTERED PRODUCT OPTIONS STATE");

  // Always work with the latest conversation
  conversation = await conversationService.getConversationById(conversation.id);

  const context = conversation.context || {};

  let { menuItemId, optionGroupIndex = 0, selectedOptions = [] } = context;

  let product;

  try {
    product = await menuService.getProductWithOptions(
      menuItemId,
      conversation.restaurantId,
    );
  } catch (error) {
    if ([404, 409].includes(error?.statusCode)) {
      await goToState(conversation, ConversationState.VIEWING_MENU);
      await sendMessage(
        conversation.restaurantId,
        text(
          message.from,
          "That product is no longer available. Please choose from the current menu.",
        ),
      );

      return categoryState.handle(conversation, {
        ...message,
        buttonReply: null,
        listReply: null,
      });
    }

    throw error;
  }

  if (!product) {
    throw new Error("Product not found.");
  }

  // Product has no option groups
  if (product.optionGroups.length === 0) {
    await goToState(conversation, ConversationState.ADDING_TO_CART);

    const updatedConversation = await conversationService.getConversationById(
      conversation.id,
    );

    return sendMessage(
      updatedConversation.restaurantId,
      text(
        message.from,
        `How many would you like to order?\n\nEnter a whole number from 1 to ${MAX_CART_QUANTITY}.`,
      ),
    );
  }

  const currentGroup = product.optionGroups[optionGroupIndex];

  if (!currentGroup || currentGroup.options.length === 0) {
    await goToState(conversation, ConversationState.VIEWING_MENU);
    await sendMessage(
      conversation.restaurantId,
      text(
        message.from,
        "That menu option is no longer available. Please choose from the current menu.",
      ),
    );

    return categoryState.handle(conversation, {
      ...message,
      buttonReply: null,
      listReply: null,
    });
  }

  // Process selected option
  if (message.listReply) {
    const selectedOption = currentGroup.options.find(
      (option) => option.id === message.listReply.id,
    );

    if (!selectedOption) {
      await goToState(conversation, ConversationState.VIEWING_MENU);
      await sendMessage(
        conversation.restaurantId,
        text(
          message.from,
          "That option is no longer available. Please choose from the current menu.",
        ),
      );

      return categoryState.handle(conversation, {
        ...message,
        buttonReply: null,
        listReply: null,
      });
    }

    selectedOptions.push(selectedOption.id);
    optionGroupIndex++;

    await conversationService.updateContext(conversation.id, {
      selectedOptions,
      optionGroupIndex,
    });

    // Reload latest context
    conversation = await conversationService.getConversationById(
      conversation.id,
    );

    ({
      menuItemId,
      optionGroupIndex = 0,
      selectedOptions = [],
    } = conversation.context);
  }

  // Finished all option groups
  if (optionGroupIndex >= product.optionGroups.length) {
    console.log("Transitioning to:", ConversationState.ADDING_TO_CART);
    await goToState(conversation, ConversationState.ADDING_TO_CART);

    const updatedConversation = await conversationService.getConversationById(
      conversation.id,
    );

    console.log("State after transition:", updatedConversation.state);

    return sendMessage(
      updatedConversation.restaurantId,
      text(
        message.from,
        `How many would you like to order?\n\nEnter a whole number from 1 to ${MAX_CART_QUANTITY}.`,
      ),
    );
  }

  return sendMessage(
    conversation.restaurantId,
    list(message.from, `Customize ${product.name}`, currentGroup.name, [
      {
        title: currentGroup.name,
        rows: currentGroup.options.map((option) => ({
          id: option.id,
          title: option.name,
          description:
            Number(option.extraPrice) > 0 ? `+Rs ${option.extraPrice}` : "",
        })),
      },
    ]),
  );
};
