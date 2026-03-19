-- Add Gelato store product ID to Product for idempotent sync
ALTER TABLE "Product" ADD COLUMN "gelatoProductId" TEXT;
CREATE UNIQUE INDEX "Product_gelatoProductId_key" ON "Product"("gelatoProductId");

-- Add Gelato store variant ID to ProductVariant for idempotent sync
ALTER TABLE "ProductVariant" ADD COLUMN "gelatoVariantId" TEXT;
CREATE UNIQUE INDEX "ProductVariant_gelatoVariantId_key" ON "ProductVariant"("gelatoVariantId");
