import { PrismaClient, ProductType, ShirtSize } from "@/server/db/generated/prisma/client";
import { env } from "@/server/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Gelato productUid builder for unisex crewneck classic t-shirts
function tshirtUid(size: "s" | "m" | "l" | "xl" | "2xl", color: string, print = "4-4") {
  return `apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_${size}_gco_${color}_gpr_${print}`;
}

// Gelato productUid builder for unisex pullover hoodie
function hoodieUid(size: "s" | "m" | "l" | "xl" | "2xl", color: string, print = "4-4") {
  return `apparel_product_gca_hoodie_gsc_pullover_gcu_unisex_gqa_classic_gsi_${size}_gco_${color}_gpr_${print}`;
}

// Map Brazilian shirt sizes to Gelato size codes
const sizeMap: Record<ShirtSize, "s" | "m" | "l" | "xl" | "2xl"> = {
  PP: "s",
  P: "s",
  M: "m",
  G: "l",
  GG: "xl",
};

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data in dependency order
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderAddress.deleteMany();
  await prisma.shipping.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productPrintFile.deleteMany();
  await prisma.product.deleteMany();

  // ─── Product 1: Camiseta Sonic Youth ──────────────────────────────────────────
  await prisma.product.create({
    data: {
      name: "Camiseta Sonic Youth",
      description: "Malha penteada 100% algodão, estampa alternativa com design exclusivo. Gramatura 180g/m².",
      sku: "HYPECULT-SY-001",
      type: ProductType.tshirt,
      price: 89.9,
      // Storefront display: mockup photos customers will see
      images: {
        create: [
          { url: "/products/sonic-youth-mockup-front.png", alt: "Frente da camiseta", order: 1 },
          { url: "/products/sonic-youth-mockup-back.png",  alt: "Costas da camiseta", order: 2 },
        ],
      },
      // Print-ready artwork sent to Gelato for fulfillment
      printFiles: {
        create: [
          { fileType: "front", url: "https://cdn.hypecult.com/print/sonic-youth-front-artwork.png", order: 1 },
          { fileType: "back",  url: "https://cdn.hypecult.com/print/sonic-youth-back-artwork.png",  order: 2 },
        ],
      },
      variants: {
        create: [
          { color: "preto", size: ShirtSize.P,  stock: 12, productUid: tshirtUid(sizeMap[ShirtSize.P],  "black") },
          { color: "preto", size: ShirtSize.M,  stock: 18, productUid: tshirtUid(sizeMap[ShirtSize.M],  "black") },
          { color: "preto", size: ShirtSize.G,  stock: 14, productUid: tshirtUid(sizeMap[ShirtSize.G],  "black") },
          { color: "preto", size: ShirtSize.GG, stock: 7,  productUid: tshirtUid(sizeMap[ShirtSize.GG], "black") },
        ],
      },
    },
  });

  // ─── Product 2: Camiseta My Bloody Valentine ───────────────────────────────────
  await prisma.product.create({
    data: {
      name: "Camiseta My Bloody Valentine",
      description: "Camiseta branca oversized com estampa shoegaze. Malha premium 200g/m².",
      sku: "HYPECULT-MBV-001",
      type: ProductType.tshirt,
      price: 99.9,
      images: {
        create: [
          { url: "/products/mbv-mockup-front.png", alt: "Frente da camiseta", order: 1 },
          { url: "/products/mbv-mockup-back.png",  alt: "Costas da camiseta", order: 2 },
        ],
      },
      printFiles: {
        create: [
          { fileType: "front", url: "https://cdn.hypecult.com/print/mbv-front-artwork.png", order: 1 },
          { fileType: "back",  url: "https://cdn.hypecult.com/print/mbv-back-artwork.png",  order: 2 },
        ],
      },
      variants: {
        create: [
          { color: "branco", size: ShirtSize.P,  stock: 8,  productUid: tshirtUid(sizeMap[ShirtSize.P],  "white") },
          { color: "branco", size: ShirtSize.M,  stock: 15, productUid: tshirtUid(sizeMap[ShirtSize.M],  "white") },
          { color: "branco", size: ShirtSize.G,  stock: 11, productUid: tshirtUid(sizeMap[ShirtSize.G],  "white") },
          { color: "branco", size: ShirtSize.GG, stock: 5,  productUid: tshirtUid(sizeMap[ShirtSize.GG], "white") },
        ],
      },
    },
  });

  // ─── Product 3: Camiseta Radiohead ────────────────────────────────────────────
  await prisma.product.create({
    data: {
      name: "Camiseta Radiohead",
      description: "Design minimalista inspirado na era OK Computer. 100% algodão orgânico.",
      sku: "HYPECULT-RH-001",
      type: ProductType.tshirt,
      price: 94.9,
      images: {
        create: [
          { url: "/products/radiohead-mockup-front.png", alt: "Frente da camiseta", order: 1 },
        ],
      },
      printFiles: {
        create: [
          { fileType: "front", url: "https://cdn.hypecult.com/print/radiohead-front-artwork.png", order: 1 },
        ],
      },
      variants: {
        create: [
          { color: "preto", size: ShirtSize.PP, stock: 5,  productUid: tshirtUid("s",                   "black") },
          { color: "preto", size: ShirtSize.P,  stock: 10, productUid: tshirtUid(sizeMap[ShirtSize.P],  "black") },
          { color: "preto", size: ShirtSize.M,  stock: 20, productUid: tshirtUid(sizeMap[ShirtSize.M],  "black") },
          { color: "preto", size: ShirtSize.G,  stock: 16, productUid: tshirtUid(sizeMap[ShirtSize.G],  "black") },
          { color: "preto", size: ShirtSize.GG, stock: 8,  productUid: tshirtUid(sizeMap[ShirtSize.GG], "black") },
        ],
      },
    },
  });

  // ─── Product 4: Moletom The Cure ──────────────────────────────────────────────
  await prisma.product.create({
    data: {
      name: "Moletom The Cure",
      description: "Moletom unissex com capuz e bolso canguru. Estampa exclusiva da era Disintegration.",
      sku: "HYPECULT-TC-001",
      type: ProductType.hoodie,
      price: 189.9,
      images: {
        create: [
          { url: "/products/the-cure-mockup-front.png", alt: "Frente do moletom", order: 1 },
          { url: "/products/the-cure-mockup-back.png",  alt: "Costas do moletom", order: 2 },
        ],
      },
      printFiles: {
        create: [
          { fileType: "front", url: "https://cdn.hypecult.com/print/the-cure-front-artwork.png", order: 1 },
          { fileType: "back",  url: "https://cdn.hypecult.com/print/the-cure-back-artwork.png",  order: 2 },
        ],
      },
      variants: {
        create: [
          { color: "preto", size: ShirtSize.P,  stock: 6,  productUid: hoodieUid(sizeMap[ShirtSize.P],  "black") },
          { color: "preto", size: ShirtSize.M,  stock: 12, productUid: hoodieUid(sizeMap[ShirtSize.M],  "black") },
          { color: "preto", size: ShirtSize.G,  stock: 9,  productUid: hoodieUid(sizeMap[ShirtSize.G],  "black") },
          { color: "preto", size: ShirtSize.GG, stock: 4,  productUid: hoodieUid(sizeMap[ShirtSize.GG], "black") },
        ],
      },
    },
  });

  // ─── Product 5: Camiseta Joy Division ─────────────────────────────────────────
  await prisma.product.create({
    data: {
      name: "Camiseta Joy Division",
      description: "Clássico Unknown Pleasures, estampa frente. Algodão leve 160g/m², corte relaxado.",
      sku: "HYPECULT-JD-001",
      type: ProductType.tshirt,
      price: 84.9,
      images: {
        create: [
          { url: "/products/joy-division-mockup-front.png", alt: "Frente da camiseta", order: 1 },
        ],
      },
      printFiles: {
        create: [
          // 4-0 print = front only (no back print for this design)
          { fileType: "front", url: "https://cdn.hypecult.com/print/joy-division-front-artwork.png", order: 1 },
        ],
      },
      variants: {
        create: [
          { color: "preto", size: ShirtSize.P,  stock: 14, productUid: tshirtUid(sizeMap[ShirtSize.P],  "black", "4-0") },
          { color: "preto", size: ShirtSize.M,  stock: 22, productUid: tshirtUid(sizeMap[ShirtSize.M],  "black", "4-0") },
          { color: "preto", size: ShirtSize.G,  stock: 18, productUid: tshirtUid(sizeMap[ShirtSize.G],  "black", "4-0") },
          { color: "preto", size: ShirtSize.GG, stock: 9,  productUid: tshirtUid(sizeMap[ShirtSize.GG], "black", "4-0") },
        ],
      },
    },
  });

  console.log("✅ Seed finalizado — 5 produtos criados");
  console.log("   • Display images: mockups para o cliente");
  console.log("   • Print files: artes em alta resolução para o Gelato");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
