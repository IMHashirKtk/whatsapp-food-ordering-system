/*
  Warnings:

  - You are about to drop the `restaurant_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "restaurant_settings" DROP CONSTRAINT "restaurant_settings_restaurantId_fkey";

-- DropTable
DROP TABLE "restaurant_settings";

-- CreateTable
CREATE TABLE "RestaurantSettings" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Karachi',
    "currencySymbol" TEXT NOT NULL DEFAULT 'Rs',
    "orderPrefix" TEXT NOT NULL DEFAULT 'ORD',
    "autoAcceptOrders" BOOLEAN NOT NULL DEFAULT false,
    "metaPhoneNumberId" TEXT,
    "metaDisplayPhone" TEXT,
    "metaBusinessAccountId" TEXT,
    "metaAccessToken" TEXT,
    "metaVerifyToken" TEXT,
    "webhookSecret" TEXT,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessage" TEXT,
    "orderConfirmation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantSettings_restaurantId_key" ON "RestaurantSettings"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantSettings_metaPhoneNumberId_key" ON "RestaurantSettings"("metaPhoneNumberId");

-- AddForeignKey
ALTER TABLE "RestaurantSettings" ADD CONSTRAINT "RestaurantSettings_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
