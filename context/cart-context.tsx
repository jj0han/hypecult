"use client";
import { ArrowRightIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useTRPC } from "@/lib/trpc";
import { mergeCartItems } from "./cart-merge";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  color: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
};

type CartContextType = {
  cart: CartItem[] | null;
  add: (item: CartItem) => void;
  remove: (variantId: string) => void;
  increment: (variantId: string, quantity: number) => void;
  clear: () => void;
  total: number | undefined;
  isPending: boolean;
  isLoading: boolean;
  isUpdating: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

function normalizeCartItems(input: CartItem[]) {
  const byVariant = new Map<string, CartItem>();
  for (const item of input) {
    const existing = byVariant.get(item.variantId);
    if (!existing) {
      byVariant.set(item.variantId, item);
      continue;
    }

    byVariant.set(item.variantId, {
      ...existing,
      quantity: existing.quantity + item.quantity,
    });
  }

  return Array.from(byVariant.values()).sort((a, b) =>
    a.variantId.localeCompare(b.variantId)
  );
}

function getCartHash(input: CartItem[]) {
  return JSON.stringify(
    input.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      size: item.size ?? null,
    }))
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const trpc = useTRPC();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const localStorageKey = "cart";
  const didHydrateAuthenticatedCart = useRef(false);
  const lastSyncedHash = useRef<string | null>(null);
  const [cart, setCart] = useState<CartItem[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const localStorageCart = window.localStorage.getItem(localStorageKey);
      return localStorageCart ? JSON.parse(localStorageCart) : null;
    } catch {
      return null;
    }
  });
  const listServerCart = useQuery(
    trpc.cart.list.queryOptions(undefined, {
      enabled: isAuthenticated,
    })
  );
  const replaceServerCart = useMutation(
    trpc.cart.replace.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  function add(item: CartItem) {
    setCart((prev) => {
      if (!prev) return [item];
      const existingItem = prev.find((i) => i.variantId === item.variantId);

      if (existingItem) {
        return prev.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prev, item];
    });

    toast.custom(
      (id) => (
        <Item variant={"outline"} className="bg-background grid grid-cols-2">
          <ItemContent className="col-span-2 relative">
            <ItemTitle>Adicionado ao carrinho!</ItemTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => toast.dismiss(id)}
              className="absolute top-0 right-0"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </Button>
          </ItemContent>
          <ItemMedia
            variant="image"
            className="rounded-lg border aspect-square size-full relative"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain"
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{item.name}</ItemTitle>
            <ItemDescription>Tamanho: {item.size}</ItemDescription>
            <ItemTitle>
              {item.price.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </ItemTitle>
          </ItemContent>
          <ItemActions className="col-span-2">
            <Button
              size="lg"
              onClick={() => router.push("/checkout")}
              className="w-full"
            >
              Ver carrinho
              <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} />
            </Button>
          </ItemActions>
        </Item>
      ),
      {
        dismissible: true,
        closeButton: true,
      }
    );
  }

  function remove(variantId: string) {
    setCart((prev) => {
      if (!prev) return null;
      return prev.filter((i) => i.variantId !== variantId);
    });
    toast.success(`${variantId} removido do carrinho`);
  }

  function increment(variantId: string, quantity: number) {
    setCart((prev) => {
      if (!prev) return null;
      const target = prev.find((i) => i.variantId === variantId);
      if (!target) return prev;
      if (target.quantity + quantity <= 0) {
        return prev.filter((i) => i.variantId !== variantId);
      }
      return prev.map((i) => {
        return i.variantId === variantId
          ? { ...i, quantity: i.quantity + quantity }
          : i;
      });
    });
  }

  function clear() {
    setCart(null);
    localStorage.removeItem(localStorageKey);
  }

  const total = cart?.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (!isAuthenticated) {
      didHydrateAuthenticatedCart.current = false;
      lastSyncedHash.current = null;
      return;
    }
    if (didHydrateAuthenticatedCart.current) return;
    if (!listServerCart.data) return;

    const serverCart = normalizeCartItems(listServerCart.data);
    const merged = normalizeCartItems(mergeCartItems(cart ?? [], serverCart));
    setCart(merged.length > 0 ? merged : null);
    didHydrateAuthenticatedCart.current = true;
    lastSyncedHash.current = getCartHash(serverCart);
    if (typeof window !== "undefined") {
      localStorage.removeItem(localStorageKey);
    }
  }, [isAuthenticated, listServerCart.data, cart]);

  useEffect(() => {
    if (!isAuthenticated || !didHydrateAuthenticatedCart.current) return;
    const normalizedCart = normalizeCartItems(cart ?? []);
    const currentHash = getCartHash(normalizedCart);
    if (currentHash === lastSyncedHash.current) return;

    lastSyncedHash.current = currentHash;
    replaceServerCart.mutate(normalizedCart, {
      onError: () => {
        // allow future retries if this sync failed
        lastSyncedHash.current = null;
      },
    });
  }, [isAuthenticated, cart, replaceServerCart]);

  useEffect(() => {
    if (isAuthenticated) return;
    if (typeof window === "undefined") return;
    if (cart && cart.length > 0) {
      localStorage.setItem(localStorageKey, JSON.stringify(cart));
    } else {
      localStorage.removeItem(localStorageKey);
    }
  }, [cart, isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        add,
        remove,
        increment,
        clear,
        total,
        isPending: listServerCart.isPending,
        isLoading: listServerCart.isLoading,
        isUpdating: replaceServerCart.isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
