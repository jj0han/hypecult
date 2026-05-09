/** biome-ignore-all lint/performance/noImgElement: we need to use an image element */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: we need to use the index as a key */
"use client";
import {
  AlertTriangle,
  CancelCircleIcon,
  CheckmarkCircleIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Suspense, useState } from "react";
import superjson from "superjson";
import { Intro } from "@/components/animations/intro";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { TRPCProvider } from "@/lib/trpc";
import type { AppRouter } from "@/server/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function makeTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}

let browserTrpcClient: ReturnType<typeof makeTrpcClient> | undefined;

function getTrpcClient() {
  if (typeof window === "undefined") return makeTrpcClient();
  if (!browserTrpcClient) browserTrpcClient = makeTrpcClient();
  return browserTrpcClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const trpcClient = getTrpcClient();
  const [intro, setIntro] = useState(true);

  if (typeof window !== "undefined") {
    if (!sessionStorage.getItem("intro-completed") && intro !== true) {
      setIntro(true);
    }
  }

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <CartProvider>
            <ThemeProvider attribute="class" defaultTheme="light">
              <Suspense
                fallback={
                  <div className="h-screen w-screen flex items-center justify-center">
                    <Spinner strokeWidth={2} className="text-primary" />
                  </div>
                }
              >
                <AuthProvider>
                  <TooltipProvider>
                    <main key="content">{children}</main>
                    {intro && (
                      <Intro
                        key="intro"
                        onComplete={() => {
                          setIntro(false);
                        }}
                      />
                    )}
                    <Toaster
                      theme="light"
                      position="bottom-center"
                      icons={{
                        success: (
                          <HugeiconsIcon
                            icon={CheckmarkCircleIcon}
                            strokeWidth={2}
                            className="size-4 text-green-500"
                          />
                        ),
                        error: (
                          <HugeiconsIcon
                            icon={CancelCircleIcon}
                            strokeWidth={2}
                            className="size-4 text-red-500"
                          />
                        ),
                        info: (
                          <HugeiconsIcon
                            icon={InformationCircleIcon}
                            strokeWidth={2}
                            className="size-4 text-blue-500"
                          />
                        ),
                        warning: (
                          <HugeiconsIcon
                            icon={AlertTriangle}
                            strokeWidth={2}
                            className="size-4 text-yellow-600"
                          />
                        ),
                      }}
                    />
                  </TooltipProvider>
                </AuthProvider>
              </Suspense>
            </ThemeProvider>
          </CartProvider>
        </TRPCProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
