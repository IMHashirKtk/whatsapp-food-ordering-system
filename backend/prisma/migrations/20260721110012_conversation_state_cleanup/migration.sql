/*
  Warnings:

  - You are about to drop the column `state` on the `Customer` table. All the data in the column will be lost.
  - The `state` column on the `conversations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "state";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "state",
ADD COLUMN     "state" "ConversationState" NOT NULL DEFAULT 'MAIN_MENU';
