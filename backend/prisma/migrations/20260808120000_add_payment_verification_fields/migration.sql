-- Additive audit fields for manual order payment verification.
ALTER TABLE "orders"
ADD COLUMN "paymentVerifiedAt" TIMESTAMP(3),
ADD COLUMN "paymentVerifiedBy" TEXT,
ADD COLUMN "paymentVerificationNote" TEXT;
