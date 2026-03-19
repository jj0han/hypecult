import { PrismaClient } from "@/server/db/generated/prisma/client";
import { env } from "@/server/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { syncGelatoProducts } from "@/server/services/gelato.sync.service";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing product data in dependency order
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.shipping.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productPrintFile.deleteMany();
  await prisma.product.deleteMany();

  console.log("🔄 Syncing products from Gelato store...");

  const result = await syncGelatoProducts(prisma);

  console.log(`✅ Sync complete:`);
  console.log(`   • ${result.productsUpserted} products`);
  console.log(`   • ${result.variantsUpserted} variants`);
  console.log(`   • ${result.imagesUpdated} images`);

  if (result.errors.length > 0) {
    console.warn("⚠️  Errors during sync:");
    for (const err of result.errors) {
      console.warn(`   - ${err}`);
    }
  }

  console.log("");
  console.log(
    "ℹ️  Synced products start with price = 0 and active = false."
  );
  console.log(
    "   Set a price on each product in the database to make it visible in the store."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
