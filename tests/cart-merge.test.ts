import assert from "node:assert/strict";
import test from "node:test";
import { mergeCartItems } from "@/context/cart-merge";

test("mergeCartItems sums quantities by variantId", () => {
  const merged = mergeCartItems(
    [
      {
        productId: "1ec6de18-d840-4d58-b615-f0079f632742",
        variantId: "3f892614-c5ee-40f6-b59a-f2f2d0e0dcd7",
        productUid: "uid-a",
        name: "Camiseta A",
        sku: "SKU-A",
        color: "Branco",
        price: 79.9,
        image: "/a.png",
        quantity: 2,
        size: "M",
      },
    ],
    [
      {
        productId: "1ec6de18-d840-4d58-b615-f0079f632742",
        variantId: "3f892614-c5ee-40f6-b59a-f2f2d0e0dcd7",
        productUid: "uid-a",
        name: "Camiseta A",
        sku: "SKU-A",
        color: "Branco",
        price: 79.9,
        image: "/a.png",
        quantity: 1,
        size: "M",
      },
      {
        productId: "5a2f7b6d-c9ef-4f2d-b8ee-7f48eefe3ca1",
        variantId: "7ca2a98f-4fd2-44fc-9482-66856f75608b",
        productUid: "uid-b",
        name: "Camiseta B",
        sku: "SKU-B",
        color: "Preto",
        price: 89.9,
        image: "/b.png",
        quantity: 1,
        size: "G",
      },
    ]
  );

  const byVariant = new Map(merged.map((item) => [item.variantId, item]));

  assert.equal(byVariant.get("3f892614-c5ee-40f6-b59a-f2f2d0e0dcd7")?.quantity, 3);
  assert.equal(byVariant.get("7ca2a98f-4fd2-44fc-9482-66856f75608b")?.quantity, 1);
});

