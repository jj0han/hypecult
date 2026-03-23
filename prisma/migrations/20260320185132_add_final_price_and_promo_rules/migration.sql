-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "originalPrice" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "finalPrice" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "finalPrice" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "allowOnDiscountedItems" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "freeShippingMaxAmount" DECIMAL(65,30);
