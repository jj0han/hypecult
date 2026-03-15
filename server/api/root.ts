import { addressRouter } from "./routers/address";
import { authRouter } from "./routers/auth";
import { cartRouter } from "./routers/cart";
import { orderRouter } from "./routers/order";
import { prodigiOrderRouter } from "./routers/prodigi.order";
import { prodigiProductDetailsRouter } from "./routers/prodigi.product.details";
import { prodigiQuoteRouter } from "./routers/prodigi.quote";
import { productRouter } from "./routers/product";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  product: productRouter,
  auth: authRouter,
  address: addressRouter,
  order: orderRouter,
  prodigiOrder: prodigiOrderRouter,
  prodigiQuote: prodigiQuoteRouter,
  prodigiProductDetails: prodigiProductDetailsRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;
