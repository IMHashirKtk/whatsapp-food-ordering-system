import * as menuService from "../../menu/menu.service.js";

import { list, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { saveContext } from "./state.helper.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

export const handle = async (conversation, message) => {
  const categories = await menuService.getActiveCategories();

  if (!categories.length) {
    return sendMessage(
      text(message.from, "Sorry, our menu is currently unavailable."),
    );
  }

  const sections = [
    {
      title: "Food Categories",
      rows: categories.map((category) => ({
        id: category.id,
        title: category.name,
        description:
          category.description ?? `${category._count.menuItems} items`,
      })),
    },
  ];

  await sendMessage(
    list(
      message.from,
      "Please choose a category.",
      "Browse",
      sections,
      "🍔 Foodaji Menu",
    ),
  );

  await saveContext(conversation, {});

  await goToState(conversation, ConversationState.PRODUCT);
};
