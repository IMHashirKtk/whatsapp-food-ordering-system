import * as menuService from "../../menu/menu.service.js";
import * as conversationService from "../conversation.service.js";

import { list, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  const context = conversation.context || {};

  let { menuItemId, optionGroupIndex = 0, selectedOptions = [] } = context;

  const product = await menuService.getProductWithOptions(
    menuItemId,
    conversation.restaurantId,
  );

  if (!product) {
    throw new Error("Product not found.");
  }

  // Product has no option groups
  if (product.optionGroups.length === 0) {
    await goToState(conversation, ConversationState.VIEWING_CART);

    return sendMessage(
      conversation.restaurantId,
      text(message.from, "How many would you like to order?\n\nExample: 2"),
    );
  }

  /**
   * Process an option selection ONLY if the selected id
   * belongs to the current option group.
   *
   * This prevents the initial product selection listReply
   * from being treated as an option.
   */
  if (message.listReply) {
    const currentGroup = product.optionGroups[optionGroupIndex];

    const selectedOption = currentGroup.options.find(
      (option) => option.id === message.listReply.id,
    );

    if (selectedOption) {
      selectedOptions.push(selectedOption.id);

      optionGroupIndex++;

      await conversationService.updateContext(conversation.id, {
        selectedOptions,
        optionGroupIndex,
      });
    }
  }

  // Finished all option groups
  if (optionGroupIndex >= product.optionGroups.length) {
    await goToState(conversation, ConversationState.VIEWING_CART);

    return sendMessage(
      conversation.restaurantId,
      text(message.from, "How many would you like to order?\n\nExample: 2"),
    );
  }

  const currentGroup = product.optionGroups[optionGroupIndex];

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
