import { addressRouter } from "./routers/address";
import { authRouter } from "./routers/auth";
import { cartRouter } from "./routers/cart";
import { orderRouter } from "./routers/order";
import { productRouter } from "./routers/product";
import { shippingRouter } from "./routers/shiping";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  product: productRouter,
  shipping: shippingRouter,
  auth: authRouter,
  address: addressRouter,
  order: orderRouter,
  cart: cartRouter,
});

export type AppRouter = typeof appRouter;