import * as menuService from "../../menu/menu.service.js";
import * as conversationService from "../conversation.service.js";

import { list, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  const context = conversation.context || {};

  const { menuItemId, optionGroupIndex = 0, selectedOptions = [] } = context;

  const product = await menuService.getProductWithOptions(menuItemId);

  // No option groups → proceed directly to cart
  if (!product.optionGroups.length) {
    await goToState(conversation, ConversationState.VIEWING_CART);

    return sendMessage(
      text(message.from, "Product added.\n\nHow many would you like to order?"),
    );
  }

  // User selected an option
  if (message.listReply) {
    selectedOptions.push(message.listReply.id);

    const nextIndex = optionGroupIndex + 1;

    // Finished all option groups
    if (nextIndex >= product.optionGroups.length) {
      await conversationService.updateContext(conversation.id, {
        selectedOptions,
        optionGroupIndex: nextIndex,
      });

      await goToState(conversation, ConversationState.VIEWING_CART);

      return sendMessage(
        text(message.from, "How many would you like to order?\n\nExample: 2"),
      );
    }

    await conversationService.updateContext(conversation.id, {
      selectedOptions,
      optionGroupIndex: nextIndex,
    });
  }

  const currentGroup =
    product.optionGroups[
      message.listReply ? optionGroupIndex + 1 : optionGroupIndex
    ];

  return sendMessage(
    list(message.from, currentGroup.name, "Choose", [
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
