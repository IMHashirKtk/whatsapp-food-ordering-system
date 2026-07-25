/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,restaurantId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurantId,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurantId` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "orders_orderNumber_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "restaurantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_item_options" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "conversations_restaurantId_idx" ON "conversations"("restaurantId");

-- CreateIndex
CREATE INDEX "orders_restaurantId_status_idx" ON "orders"("restaurantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_restaurantId_orderNumber_key" ON "orders"("restaurantId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_restaurantId_key" ON "orders"("id", "restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_restaurantId_email_key" ON "users"("restaurantId", "email");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
