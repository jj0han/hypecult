"use client";
import { ArrowRightIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CldImage } from "next-cloudinary";
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
import { formatCurrency } from "@/utils/formatters";
import { mergeCartItems } from "./cart-merge";
import {
  addCartItem,
  incrementCartItem,
  normalizeCartItems,
  removeCartItem,
} from "./cart-operations";

export type CartItem = {
  productId: string;
  /** Gelato product UID from the variant; null if legacy row or missing in DB. */
  productUid: string | null;
  variantId: string;
  name: string;
  sku: string;
  color: string;
  /** Effective price after any product/variant discount (finalPrice). */
  price: number;
  /** Original undiscounted price — set when the item has a product/variant discount. */
  originalPrice?: number;
  discountType?: "percentage" | "fixed";
  discountAmount?: number;
  image: string;
  quantity: number;
  size?: string;
};

type CartContextType = {
  cart: CartItem[] | null;
  add: (item: CartItem) => void;
  remove: (variantId: string) => void;
  increment: (variantId: string, quantity: number) => void;
  set: (items: CartItem[]) => void;
  clear: () => void;
  total: number | undefined;
  isPending: boolean;
  isLoading: boolean;
  isUpdating: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

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
  /** Session refresh (`update()`) uses `loading` — must not treat as logged out */
  const isGuest = status === "unauthenticated";
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
    setCart((prev) => addCartItem(prev, item));

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
            <CldImage
              src={item.image ?? "placeholder"}
              alt={item.name}
              fill
              crop="fill"
              gravity="auto"
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{item.name}</ItemTitle>
            <ItemDescription>Tamanho: {item.size}</ItemDescription>
            <ItemTitle>{formatCurrency(item.price)}</ItemTitle>
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
    setCart((prev) => removeCartItem(prev, variantId));
  }

  function increment(variantId: string, quantity: number) {
    setCart((prev) => incrementCartItem(prev, variantId, quantity));
  }

  function set(items: CartItem[]) {
    setCart(items.length > 0 ? items : null);
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
    if (isGuest) {
      didHydrateAuthenticatedCart.current = false;
      lastSyncedHash.current = null;
      return;
    }
    if (status !== "authenticated") return;
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
  }, [isGuest, status, listServerCart.data, cart]);

  useEffect(() => {
    if (status !== "authenticated" || !didHydrateAuthenticatedCart.current)
      return;
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
  }, [status, cart, replaceServerCart]);

  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (typeof window === "undefined") return;
    if (cart && cart.length > 0) {
      localStorage.setItem(localStorageKey, JSON.stringify(cart));
    } else {
      localStorage.removeItem(localStorageKey);
    }
  }, [cart, status]);

  return (
    <CartContext.Provider
      value={{
        cart,
        add,
        remove,
        increment,
        set,
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
