import * as conversationService from "../conversation.service.js";

import { list, buttons, text } from "../../meta/message.factory.js";
import { sendMessage } from "../../meta/meta.api.js";

import { ButtonAction } from "../engine/command.constants.js";
import { ConversationState } from "./state.constants.js";
import { goToState } from "./state.helper.js";

const PAYMENT_METHODS = {
  EASYPAISA: "EASYPAISA",
  JAZZCASH: "JAZZCASH",
  BANK_TRANSFER: "BANK_TRANSFER",
  COD: "COD",
};

export const show = async (conversation, phoneNumber) => {
  return sendMessage(
    conversation.restaurantId,
    list(phoneNumber, "💳 *Select Payment Method*", "Choose", [
      {
        title: "Payment Methods",
        rows: [
          {
            id: ButtonAction.PAYMENT_EASYPAISA,
            title: "Easypaisa",
            description: "Pay using Easypaisa",
          },
          {
            id: ButtonAction.PAYMENT_JAZZCASH,
            title: "JazzCash",
            description: "Pay using JazzCash",
          },
          {
            id: ButtonAction.PAYMENT_BANK_TRANSFER,
            title: "Bank Transfer",
            description: "Direct bank transfer",
          },
          {
            id: ButtonAction.PAYMENT_COD,
            title: "Cash on Delivery",
            description: "Pay when delivered",
          },
        ],
      },
    ]),
  );
};

export const handle = async (conversation, message) => {
  const action = message.listReply?.id || message.buttonReply?.id;

  switch (action) {
    case ButtonAction.PAYMENT_EASYPAISA:
      await conversationService.updateContext(conversation.id, {
        paymentMethod: PAYMENT_METHODS.EASYPAISA,
      });

      return sendMessage(
        conversation.restaurantId,
        buttons(
          message.from,
          `💳 *Easypaisa Payment*

Account Title:
Foodaji Cafe

Account Number:
03XXXXXXXXX

Please send the payment and then tap "I've Paid".`,
          [
            {
              type: "reply",
              reply: {
                id: ButtonAction.PAYMENT_DONE,
                title: "I've Paid",
              },
            },
          ],
        ),
      );

    case ButtonAction.PAYMENT_JAZZCASH:
      await conversationService.updateContext(conversation.id, {
        paymentMethod: PAYMENT_METHODS.JAZZCASH,
      });

      return sendMessage(
        conversation.restaurantId,
        buttons(
          message.from,
          `💳 *JazzCash Payment*

Account Title:
Foodaji Cafe

Account Number:
03XXXXXXXXX

Please send the payment and then tap "I've Paid".`,
          [
            {
              type: "reply",
              reply: {
                id: ButtonAction.PAYMENT_DONE,
                title: "I've Paid",
              },
            },
          ],
        ),
      );

    case ButtonAction.PAYMENT_BANK_TRANSFER:
      await conversationService.updateContext(conversation.id, {
        paymentMethod: PAYMENT_METHODS.BANK_TRANSFER,
      });

      return sendMessage(
        conversation.restaurantId,
        buttons(
          message.from,
          `🏦 *Bank Transfer*

Bank:
Meezan Bank

Account Title:
Foodaji Cafe

IBAN:
PK00MEEZ0000000000000000

Please transfer the payment and then tap "I've Paid".`,
          [
            {
              type: "reply",
              reply: {
                id: ButtonAction.PAYMENT_DONE,
                title: "I've Paid",
              },
            },
          ],
        ),
      );

    case ButtonAction.PAYMENT_COD:
      await conversationService.updateContext(conversation.id, {
        paymentMethod: PAYMENT_METHODS.COD,
      });

      return sendMessage(
        conversation.restaurantId,
        buttons(
          message.from,
          `💵 *Cash on Delivery*

You will pay when your order is delivered.

Continue?`,
          [
            {
              type: "reply",
              reply: {
                id: ButtonAction.CONFIRM_COD,
                title: "Confirm COD",
              },
            },
          ],
        ),
      );

    case ButtonAction.PAYMENT_DONE:
    case ButtonAction.CONFIRM_COD:
      await goToState(conversation, ConversationState.CHECKOUT_CONFIRM);

      return sendMessage(
        conversation.restaurantId,
        text(
          message.from,
          "✅ Payment method saved.\n\nPreparing your order summary...",
        ),
      );

    default:
      return show(conversation, message.from);
  }
};
