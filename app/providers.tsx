/** biome-ignore-all lint/performance/noImgElement: we need to use an image element */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: we need to use the index as a key */
"use client";

import { useGSAP } from "@gsap/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import gsap from "gsap";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";
import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import superjson from "superjson";
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

function Intro({ onComplete }: { onComplete: () => void }) {
  const introRootRef = useRef<HTMLDivElement>(null);
  const logoAnimRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stagger = 0.08;
      const scaleFactor = 1.515;

      const headerLogo = document.getElementById("header-logo");
      const logoAnimEl = logoAnimRef.current;

      let targetX = 0,
        targetY = 0,
        targetW = 0,
        targetH = 0;

      if (headerLogo && logoAnimEl) {
        const hRect = headerLogo.getBoundingClientRect();
        const lRect = logoAnimEl.getBoundingClientRect();
        targetX = hRect.left + hRect.width / 2 - (lRect.left + lRect.width / 2);
        targetY = hRect.top + hRect.height / 2 - (lRect.top + lRect.height / 2);
        targetW = hRect.width;
        targetH = hRect.height;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          onComplete();
          sessionStorage.setItem("intro-completed", "true");
        },
      });
      tl.fromTo(
        ".stroke-logo-animation",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.inOut", stagger }
      )
        .to(
          ".stroke-logo-animation",
          { opacity: 0, duration: 0.4, ease: "power2.inOut", stagger },
          "-=0.1"
        )
        .to(gsap.utils.toArray(".stroke-logo-animation").slice(0, 3), {
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut",
          stagger,
        })
        .to(
          gsap.utils.toArray(".stroke-logo-animation").slice(0, 3),
          { opacity: 0, duration: 0.4, ease: "power2.inOut", stagger },
          "-=0.1"
        )
        .fromTo(
          logoAnimEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          "-=0.7"
        )
        .fromTo(
          logoAnimEl,
          { scale: 1 },
          { scale: 1.05, duration: 1, delay: 0.1, ease: "sine.out" },
          "-=0.2"
        )
        .to(logoAnimEl, { scale: 1, ease: "sine.in", duration: 0.5 })
        .to(
          logoAnimEl,
          {
            x: targetX,
            y: targetY,
            scale: 1,
            width: targetW * scaleFactor,
            height: targetH * scaleFactor,
            duration: 0.8,
            ease: "sine.inOut",
          },
          "-=0.1"
        )
        .fromTo(
          ".background-animation",
          { y: 0 },
          {
            y: "-100%",
            duration: 0.5,
            stagger: { each: 0.15, from: "end" },
            ease: "power2.inOut",
          }
        );
    },
    { scope: introRootRef }
  );

  if (typeof window === "undefined") return null;
  const session = sessionStorage.getItem("intro-completed");

  if (session) {
    return null;
  }

  return (
    <div
      ref={introRootRef}
      className="fixed h-screen inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* background animated layers */}
      <div className="absolute inset-0 bg-background background-animation" />
      <div className="absolute inset-0 bg-primary background-animation" />
      <div className="absolute inset-0 bg-background background-animation" />
      {/* Animated Logos */}
      <div className="w-full max-w-7xl mx-auto absolute flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-16 w-full absolute inset-0">
            <div
              ref={logoAnimRef}
              className="w-full px-16 z-50 logo-animation"
              style={{ opacity: 0 }}
            >
              <Image
                src="/HYPECULT.svg"
                alt="Hypecult"
                width={2000}
                height={2000}
                className="z-50"
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-16 w-full absolute inset-0">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="w-full px-16 stroke-logo-animation"
                style={{ opacity: 0 }}
              >
                <Image
                  alt="Hypecult"
                  src="/HYPECULT-4.svg"
                  width={2000}
                  height={2000}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const trpcClient = getTrpcClient();
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("intro-completed")) {
      setIntro(true);
    }
  }, []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <CartProvider>
            <Suspense
              fallback={
                <div className="h-screen w-screen flex items-center justify-center">
                  <Spinner strokeWidth={2} />
                </div>
              }
            >
              <AuthProvider>
                <TooltipProvider>
                  <Fragment key="content">{children}</Fragment>
                  {intro && (
                    <Intro key="intro" onComplete={() => setIntro(false)} />
                  )}
                  <Toaster richColors theme="light" position="bottom-center" />
                </TooltipProvider>
              </AuthProvider>
            </Suspense>
          </CartProvider>
        </TRPCProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
