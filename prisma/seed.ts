import { PrismaClient, ProductType, ShirtSize } from "@/server/db/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  const product = await prisma.product.create({
    data: {
      name: "Camiseta Sonic Youth",
      description: "Camiseta 100% algodão, estampa alternativa",
      type: ProductType.tshirt,
      price: 79.9,
      images: {
        create: [
          { url: "/products/sonic-youth-1.png", order: 1 },
          { url: "/products/sonic-youth-2.png", order: 2 },
        ],
      },
      variants: {
        create: [
          { size: ShirtSize.P, stock: 10 },
          { size: ShirtSize.M, stock: 15 },
          { size: ShirtSize.G, stock: 8 },
          { size: ShirtSize.GG, stock: 5 },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Camiseta My Bloody Valentine",
      description: "Malha premium, corte oversized",
      type: ProductType.tshirt,
      price: 89.9,
      images: {
        create: [
          { url: "/products/mbv-1.png", order: 1 },
        ],
      },
      variants: {
        create: [
          { size: ShirtSize.M, stock: 12 },
          { size: ShirtSize.G, stock: 10 },
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
