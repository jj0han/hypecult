import { PrismaClient, ProductType, ShirtSize } from "@/server/db/generated/prisma/client";
import { env } from "@/server/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const product = await prisma.product.create({
    data: {
      name: "Camiseta Sonic Youth",
      description: "Camiseta 100% algodão, estampa alternativa",
      sku: "TEE-AA-1301",
      type: ProductType.tshirt,
      price: 79.9,
      images: {
        create: [
          { printArea: "default", url: "/products/sonic-youth-1.png", order: 1 },
          { printArea: "default", url: "/products/sonic-youth-2.png", order: 2 },
        ],
      },
      variants: {
        create: [
          { color: "preto", size: ShirtSize.P, stock: 10 },
          { color: "preto", size: ShirtSize.M, stock: 15 },
          { color: "preto", size: ShirtSize.G, stock: 8 },
          { color: "preto", size: ShirtSize.GG, stock: 5 },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: "TEE-AA-1301",
      name: "Camiseta My Bloody Valentine",
      description: "Malha premium, corte oversized",
      type: ProductType.tshirt,
      price: 89.9,
      images: {
        create: [
          { printArea: "default", url: "/products/mbv-1.png", order: 1 },
        ],
      },
      variants: {
        create: [
          { color: "preto", size: ShirtSize.M, stock: 12 },
          { color: "preto", size: ShirtSize.G, stock: 10 },
        ],
      },
    },
  });

  console.log("✅ Seed finalizado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
