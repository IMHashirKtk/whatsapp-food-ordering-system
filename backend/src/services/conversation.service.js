import * as customerService from "./customer.service.js";
import * as metaService from "./meta.service.js";
import * as conversationService from "../modules/conversation/conversation.service.js";
import * as menuService from "../modules/menu/menu.service.js";

const handlers = {
  IDLE,
  MAIN_MENU,
  SELECT_CATEGORY,
  SELECT_MENU_ITEM,
  SELECT_OPTION,
  SELECT_QUANTITY,
};

export const processConversation = async (customer, incomingMessage) => {
  const handler = handlers[customer.state] || UNKNOWN;

  await handler(customer, incomingMessage);
};

/* -------------------------------------------------------------------------- */
/*                                    STATES                                  */
/* -------------------------------------------------------------------------- */

async function IDLE(customer) {
  await metaService.sendTextMessage(
    customer.whatsappId,
    `👋 Welcome to Foodaji!

Reply with:

1️⃣ View Menu
2️⃣ View Cart
3️⃣ Track Order`,
  );

  await customerService.updateState(customer.id, "MAIN_MENU");
}

async function MAIN_MENU(customer, message) {
  const text = message.text.trim();

  switch (text) {
    case "1": {
      const categories = await menuService.getAllCategories();

      if (!categories.length) {
        await metaService.sendTextMessage(
          customer.whatsappId,
          "❌ No menu categories available.",
        );
        return;
      }

      let reply = "🍽 *Categories*\n\n";

      categories.forEach((category, index) => {
        reply += `${index + 1}. ${category.name}\n`;
      });

      reply += "\nReply with category number.";

      await metaService.sendTextMessage(customer.whatsappId, reply);

      await customerService.updateState(customer.id, "SELECT_CATEGORY");

      break;
    }

    case "2":
      await metaService.sendTextMessage(
        customer.whatsappId,
        "🛒 Cart feature coming next.",
      );
      break;

    case "3":
      await metaService.sendTextMessage(
        customer.whatsappId,
        "📦 No active orders.",
      );
      break;

    default:
      await metaService.sendTextMessage(
        customer.whatsappId,
        "Reply with 1, 2 or 3.",
      );
  }
}

async function SELECT_CATEGORY(customer, message) {
  const menu = await menuService.getMenuTree();

  const index = Number(message.text);

  if (Number.isNaN(index) || index < 1 || index > menu.length) {
    await metaService.sendTextMessage(
      customer.whatsappId,
      "❌ Invalid category.",
    );

    return;
  }

  const category = menu[index - 1];

  await conversationService.updateContext(customer.id, {
    categoryId: category.id,
  });

  if (!category.menuItems.length) {
    await metaService.sendTextMessage(
      customer.whatsappId,
      "No items available.",
    );

    return;
  }

  let reply = `🍽 *${category.name}*\n\n`;

  category.menuItems.forEach((item, i) => {
    reply += `${i + 1}. ${item.name} - Rs ${item.basePrice}\n`;
  });

  reply += "\nReply with item number.";

  await metaService.sendTextMessage(customer.whatsappId, reply);

  await conversationService.setState(customer.id, "SELECT_MENU_ITEM");
}

async function SELECT_MENU_ITEM(customer, message) {
  const conversation = await conversationService.getConversation(customer.id);

  const menu = await menuService.getMenuTree();

  const category = menu.find((c) => c.id === conversation.context.categoryId);

  if (!category) {
    await metaService.sendTextMessage(customer.whatsappId, "Session expired.");

    await conversationService.reset(customer.id);

    return;
  }

  const index = Number(message.text);

  if (Number.isNaN(index) || index < 1 || index > category.menuItems.length) {
    await metaService.sendTextMessage(customer.whatsappId, "❌ Invalid item.");

    return;
  }

  const item = category.menuItems[index - 1];

  await conversationService.updateContext(customer.id, {
    menuItemId: item.id,
  });

  if (!item.optionGroups.length) {
    await metaService.sendTextMessage(
      customer.whatsappId,
      `✅ ${item.name} selected.\n\nQuantity?`,
    );

    await conversationService.setState(customer.id, "SELECT_QUANTITY");

    return;
  }

  const group = item.optionGroups[0];

  let reply = `*${group.name}*\n\n`;

  group.options.forEach((option, i) => {
    reply += `${i + 1}. ${option.name}`;

    if (Number(option.extraPrice) > 0) {
      reply += ` (+Rs ${option.extraPrice})`;
    }

    reply += "\n";
  });

  reply += "\nReply with option number.";

  await conversationService.updateContext(customer.id, {
    optionGroupIndex: 0,
    selectedOptions: [],
  });

  await metaService.sendTextMessage(customer.whatsappId, reply);

  await conversationService.setState(customer.id, "SELECT_OPTION");
}

async function SELECT_OPTION(customer, message) {
  const conversation = await conversationService.getConversation(customer.id);

  const menu = await menuService.getMenuTree();

  const category = menu.find((c) => c.id === conversation.context.categoryId);

  const item = category.menuItems.find(
    (i) => i.id === conversation.context.menuItemId,
  );

  const groupIndex = conversation.context.optionGroupIndex || 0;

  const group = item.optionGroups[groupIndex];

  const index = Number(message.text);

  if (Number.isNaN(index) || index < 1 || index > group.options.length) {
    await metaService.sendTextMessage(
      customer.whatsappId,
      "❌ Invalid option.",
    );

    return;
  }

  const option = group.options[index - 1];

  const selectedOptions = [
    ...(conversation.context.selectedOptions || []),
    option.id,
  ];

  const nextGroupIndex = groupIndex + 1;

  if (nextGroupIndex >= item.optionGroups.length) {
    await conversationService.updateContext(customer.id, {
      selectedOptions,
    });

    await metaService.sendTextMessage(
      customer.whatsappId,
      "How many would you like to order?",
    );

    await conversationService.setState(customer.id, "SELECT_QUANTITY");

    return;
  }

  const nextGroup = item.optionGroups[nextGroupIndex];

  let reply = `*${nextGroup.name}*\n\n`;

  nextGroup.options.forEach((option, i) => {
    reply += `${i + 1}. ${option.name}`;

    if (Number(option.extraPrice) > 0) {
      reply += ` (+Rs ${option.extraPrice})`;
    }

    reply += "\n";
  });

  reply += "\nReply with option number.";

  await conversationService.updateContext(customer.id, {
    optionGroupIndex: nextGroupIndex,
    selectedOptions,
  });

  await metaService.sendTextMessage(customer.whatsappId, reply);
}

async function SELECT_QUANTITY(customer, message) {
  const quantity = Number(message.text);

  if (Number.isNaN(quantity) || quantity < 1 || quantity > 20) {
    await metaService.sendTextMessage(
      customer.whatsappId,
      "Please enter a quantity between 1 and 20.",
    );

    return;
  }

  await conversationService.updateContext(customer.id, {
    quantity,
  });

  await metaService.sendTextMessage(
    customer.whatsappId,
    `✅ Quantity: ${quantity}

🛒 Cart module will be implemented next.`,
  );

  await conversationService.setState(customer.id, "MAIN_MENU");
}

async function UNKNOWN(customer) {
  await customerService.updateState(customer.id, "IDLE");

  await metaService.sendTextMessage(customer.whatsappId, "Session restarted.");
}
