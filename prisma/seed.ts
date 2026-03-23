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
  await prisma.userPromotion.deleteMany();
  await prisma.productPromotion.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productPrintFile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.promotion.deleteMany();

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

  // Seed example promotion codes
  console.log("🎟️  Seeding example promotions...");

  await prisma.promotion.createMany({
    data: [
      {
        code: "LAUNCH2024",
        description: "Lançamento do site – 15% de desconto em tudo",
        discountType: "percentage",
        discountAmount: 15,
        freeShipping: false,
        active: true,
      },
      {
        code: "WELCOME10",
        description: "Primeira compra – 10% de desconto",
        discountType: "percentage",
        discountAmount: 10,
        freeShipping: false,
        userLimit: 1,
        active: true,
      },
      // TODO: limite de máximo a ser pago pelo frete grátis
      {
        code: "FREESHIP",
        description: "Frete grátis em qualquer pedido (cobre até R$30)",
        discountType: "fixed",
        discountAmount: 0,
        freeShipping: true,
        freeShippingMaxAmount: 30,
        active: true,
      },
      {
        code: "FREESHIP100",
        description: "Frete 100% grátis em qualquer pedido",
        discountType: "fixed",
        discountAmount: 0,
        freeShipping: true,
        freeShippingMaxAmount: null,
        active: true,
      },
      {
        code: "FLAT50",
        description: "R$50 de desconto em pedidos acima de R$200 (não aplica em peças já com desconto)",
        discountType: "fixed",
        discountAmount: 50,
        freeShipping: false,
        allowOnDiscountedItems: false,
        minOrderAmount: 200,
        active: true,
      },
    ],
  });

  console.log("   ✅ 5 promotions created:");
  console.log("   • LAUNCH2024  – 15% off everything");
  console.log("   • WELCOME10   – 10% off first purchase (user limit: 1)");
  console.log("   • FREESHIP    – Free shipping up to R$30");
  console.log("   • FREESHIP100 – 100% free shipping");
  console.log("   • FLAT50      – R$50 off orders above R$200 (no stack with discounted items)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
