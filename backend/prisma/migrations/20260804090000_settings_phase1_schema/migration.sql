-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "description" TEXT,
ADD COLUMN "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "RestaurantSettings" ADD COLUMN "freeDeliveryThreshold" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "minimumOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "estimatedPreparationTime" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN "orderAcceptanceEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "temporaryClosureMessage" TEXT,
ADD COLUMN "codEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "easypaisaEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "easypaisaNumber" TEXT,
ADD COLUMN "jazzcashEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "jazzcashNumber" TEXT,
ADD COLUMN "bankTransferEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "bankName" TEXT,
ADD COLUMN "bankAccountTitle" TEXT,
ADD COLUMN "bankAccountNumber" TEXT,
ADD COLUMN "paymentInstructions" TEXT,
ADD COLUMN "receiptFooter" TEXT,
ADD COLUMN "statusNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "cancellationNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
