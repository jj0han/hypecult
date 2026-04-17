import { PrismaClient } from "@/server/db/generated/prisma/client";
import { env } from "@/server/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { syncGelatoProducts } from "@/server/integrations/gelato/gelato.sync.service";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");
  console.log("🔄 Syncing products from Gelato store...");

  const result = await syncGelatoProducts(prisma);

  console.log("✅ Sync complete:");
  console.log(`   • ${result.productsUpserted} products upserted`);
  console.log(`   • ${result.variantsUpserted} variants upserted`);
  console.log(`   • ${result.imagesUpdated} images updated`);
  console.log(`   • ${result.productsDeleted} orphan products removed`);
  console.log(`   • ${result.variantsDeleted} orphan variants removed`);

  if (result.errors.length > 0) {
    console.warn("⚠️  Errors during sync:");
    for (const err of result.errors) {
      console.warn(`   - ${err}`);
    }
  }

  console.log("");
  console.log(
    "ℹ️  New products start with price = 0 and active = false."
  );
  console.log(
    "   Set a price on each product in the database to make it visible in the store."
  );

  console.log("");
  console.log("🏷️  Seeding product taxonomy (categories/subcategories) if empty...");

  const [categoryCount, subcategoryCount] = await Promise.all([
    prisma.productCategory.count(),
    prisma.subcategory.count(),
  ]);

  const shouldSeedTaxonomy = categoryCount === 0 && subcategoryCount === 0;

  if (shouldSeedTaxonomy) {
    const slugify = (value: string) =>
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const categories = [
      { name: "Camiseta Oversized" },
      { name: "Camiseta" },
    ];

    const subcategories = [
      // Orpheus vs. the Sirens example
      "Música",
      "Estadunidense",
      "hip-hop",
      "Hermit and the Recluse",

      // Great Runes / Elden Ring example
      "Games",
      "Japonês",
      "RPG",
      "Elden Ring",

      // Kirametal example
      "Indie Rock",
      "Mass of The Fermenting Dregs",
    ];

    for (const category of categories) {
      await prisma.productCategory.upsert({
        where: { name: category.name },
        create: {
          name: category.name,
          slug: slugify(category.name),
        },
        update: { slug: slugify(category.name) },
      });
    }

    for (const sub of subcategories) {
      await prisma.subcategory.upsert({
        where: { name: sub },
        create: {
          name: sub,
          slug: slugify(sub),
        },
        update: { slug: slugify(sub) },
      });
    }

    console.log("✅ Taxonomy seeded with example categories/subcategories.");
    console.log(`   • ${categories.length} categories`);
    console.log(`   • ${subcategories.length} subcategories`);
  } else {
    console.log("ℹ️  Taxonomy already exists. Skipping seeding.");
  }

  // Seed example promotion codes using upsert so re-running is idempotent
  console.log("🎟️  Upserting example promotions...");

  const promotions = [
    {
      code: "LAUNCH2024",
      description: "Lançamento do site – 15% de desconto em tudo",
      discountType: "percentage" as const,
      discountAmount: 15,
      freeShipping: false,
      active: true,
    },
    {
      code: "WELCOME10",
      description: "Primeira compra – 10% de desconto",
      discountType: "percentage" as const,
      discountAmount: 10,
      freeShipping: false,
      userLimit: 1,
      active: true,
    },
    // TODO: limite de máximo a ser pago pelo frete grátis
    {
      code: "FREESHIP",
      description: "Frete grátis em qualquer pedido (cobre até R$30)",
      discountType: "fixed" as const,
      discountAmount: 0,
      freeShipping: true,
      freeShippingMaxAmount: 30,
      active: true,
    },
    {
      code: "FREESHIP100",
      description: "Frete 100% grátis em qualquer pedido",
      discountType: "fixed" as const,
      discountAmount: 0,
      freeShipping: true,
      freeShippingMaxAmount: null,
      active: true,
    },
    {
      code: "FLAT50",
      description: "R$50 de desconto em pedidos acima de R$200 (não aplica em peças já com desconto)",
      discountType: "fixed" as const,
      discountAmount: 50,
      freeShipping: false,
      allowOnDiscountedItems: false,
      minOrderAmount: 200,
      active: true,
    },
  ];

  for (const promo of promotions) {
    await prisma.promotion.upsert({
      where: { code: promo.code },
      create: promo,
      update: promo,
    });
  }

  console.log("   ✅ 5 promotions upserted:");
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
