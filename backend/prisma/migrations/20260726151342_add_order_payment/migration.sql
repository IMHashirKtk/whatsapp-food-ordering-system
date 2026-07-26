/*
  Warnings:

  - The `paymentMethod` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentStatus` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER', 'COD');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING_VERIFICATION', 'UNPAID', 'PAID');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD',
DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID';
