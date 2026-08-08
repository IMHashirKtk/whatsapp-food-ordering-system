-- CreateEnum
CREATE TYPE "MessageProcessingStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Message"
ADD COLUMN "processingStatus" "MessageProcessingStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN "processingStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "processingToken" TEXT,
ADD COLUMN "processedAt" TIMESTAMP(3),
ALTER COLUMN "customerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cart_items"
ADD COLUMN "sourceMessageId" TEXT;

-- AlterTable
ALTER TABLE "orders"
ADD COLUMN "sourceMessageId" TEXT;

-- CreateIndex
CREATE INDEX "Message_processingStatus_processingStartedAt_idx"
ON "Message"("processingStatus", "processingStartedAt");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_sourceMessageId_key"
ON "cart_items"("sourceMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_sourceMessageId_key"
ON "orders"("sourceMessageId");
