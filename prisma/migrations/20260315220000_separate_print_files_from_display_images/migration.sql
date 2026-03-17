-- Remove printArea column from ProductImage (display images don't need Gelato file types)
ALTER TABLE "ProductImage" DROP COLUMN "printArea";

-- Add optional alt text to ProductImage
ALTER TABLE "ProductImage" ADD COLUMN "alt" TEXT;

-- Create ProductPrintFile table for print-ready artwork sent to Gelato
CREATE TABLE "ProductPrintFile" (
    "id"        TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fileType"  TEXT NOT NULL,
    "url"       TEXT NOT NULL,
    "order"     INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPrintFile_pkey" PRIMARY KEY ("id")
);

-- Add foreign key to Product
ALTER TABLE "ProductPrintFile" ADD CONSTRAINT "ProductPrintFile_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
