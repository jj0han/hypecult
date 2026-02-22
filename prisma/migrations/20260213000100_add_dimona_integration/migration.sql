-- CreateEnum
CREATE TYPE "ExternalProvider" AS ENUM ('dimona');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "externalProvider" "ExternalProvider",
ADD COLUMN     "externalOrderId" TEXT,
ADD COLUMN     "externalStatus" TEXT,
ADD COLUMN     "externalSyncedAt" TIMESTAMP(3),
ADD COLUMN     "externalLastError" TEXT,
ADD COLUMN     "externalRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "externalLastAttemptAt" TIMESTAMP(3),
ADD COLUMN     "externalNextRetryAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT;

-- CreateTable
CREATE TABLE "ProductProviderMapping" (
    "id" TEXT NOT NULL,
    "provider" "ExternalProvider" NOT NULL,
    "variantId" TEXT NOT NULL,
    "externalProductId" TEXT,
    "externalVariantId" TEXT,
    "externalSku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductProviderMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON "Order"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Order_externalProvider_externalStatus_idx" ON "Order"("externalProvider", "externalStatus");

-- CreateIndex
CREATE INDEX "Order_externalNextRetryAt_idx" ON "Order"("externalNextRetryAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_externalProvider_externalOrderId_key" ON "Order"("externalProvider", "externalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductProviderMapping_provider_variantId_key" ON "ProductProviderMapping"("provider", "variantId");

-- CreateIndex
CREATE INDEX "ProductProviderMapping_provider_externalVariantId_idx" ON "ProductProviderMapping"("provider", "externalVariantId");

-- AddForeignKey
ALTER TABLE "ProductProviderMapping" ADD CONSTRAINT "ProductProviderMapping_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

