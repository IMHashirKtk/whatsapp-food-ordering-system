/*
  Warnings:

  - The values [CHECKOUT] on the enum `ConversationState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ConversationState_new" AS ENUM ('IDLE', 'MAIN_MENU', 'VIEWING_MENU', 'ORDERING', 'SELECTING_OPTIONS', 'ADDING_TO_CART', 'VIEWING_CART', 'CHECKOUT_ADDRESS', 'CHECKOUT_PAYMENT', 'CHECKOUT_CONFIRM', 'TRACKING_ORDER');
ALTER TABLE "public"."conversations" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "conversations" ALTER COLUMN "state" TYPE "ConversationState_new" USING ("state"::text::"ConversationState_new");
ALTER TYPE "ConversationState" RENAME TO "ConversationState_old";
ALTER TYPE "ConversationState_new" RENAME TO "ConversationState";
DROP TYPE "public"."ConversationState_old";
ALTER TABLE "conversations" ALTER COLUMN "state" SET DEFAULT 'MAIN_MENU';
COMMIT;
