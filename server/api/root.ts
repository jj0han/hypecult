import { addressRouter } from "./routers/address";
import { authRouter } from "./routers/auth";
import { cartRouter } from "./routers/cart";
import { gelatoOrderRouter } from "./routers/gelato.order";
import { gelatoQuoteRouter } from "./routers/gelato.quote";
import { orderRouter } from "./routers/order";
import { productRouter } from "./routers/product";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  product: productRouter,
  auth: authRouter,
  address: addressRouter,
  order: orderRouter,
  gelatoOrder: gelatoOrderRouter,
  gelatoQuote: gelatoQuoteRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;
