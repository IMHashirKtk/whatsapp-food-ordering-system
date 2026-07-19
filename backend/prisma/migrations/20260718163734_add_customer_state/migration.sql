-- CreateEnum
CREATE TYPE "ConversationState" AS ENUM ('IDLE', 'MAIN_MENU', 'VIEWING_MENU', 'ORDERING', 'VIEWING_CART', 'CHECKOUT', 'TRACKING_ORDER');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "state" "ConversationState" NOT NULL DEFAULT 'IDLE';
