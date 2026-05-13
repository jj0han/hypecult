/** biome-ignore-all lint/suspicious/noArrayIndexKey: we need to use the index as a key */
"use client";
import { ArrowRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { AnimatedCarousel } from "@/components/animations/animated-carousel";
import { ProductGrid } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MaskedMarqueeItem,
} from "@/components/ui/marquee";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { useTRPC } from "@/lib/trpc";

export default function Page() {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.product.list.queryOptions());
  const { data: japaneseMusicData, isPending: isPendingJapaneseMusicData } =
    useQuery(
      trpc.product.list.queryOptions({
        subcategoryIds: ["fa9a39c3-9a1a-4d0b-8b01-98403419df85"],
      })
    );
  const { data: gamesData, isPending: isPendingGamesData } = useQuery(
    trpc.product.list.queryOptions({
      subcategoryIds: ["e7bf922b-3c76-48ac-afb2-4fed371642ef"],
    })
  );

  return (
    <div className="min-h-svh">
      <AnimatedCarousel />
      <div className="px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 justify-between">
              <h1 className="text-2xl font-bold">Novidades</h1>
              <Link
                href={"/search" as Route}
                className={buttonVariants({ variant: "link" })}
              >
                Ver todos
                <HugeiconsIcon icon={ArrowRight} strokeWidth={2} />
              </Link>
            </div>
            <ProductGrid products={data} isPending={isPending} />
          </div>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 justify-between">
              <h1 className="text-2xl font-bold">Música Japonêsa</h1>
              <Link
                href={"/search" as Route}
                className={buttonVariants({ variant: "link" })}
              >
                Ver todos
                <HugeiconsIcon icon={ArrowRight} strokeWidth={2} />
              </Link>
            </div>
            <ProductGrid
              products={japaneseMusicData}
              isPending={isPendingJapaneseMusicData}
            />
          </div>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 justify-between">
              <h1 className="text-2xl font-bold">Games</h1>
              <Link
                href={"/search" as Route}
                className={buttonVariants({ variant: "link" })}
              >
                Ver todos
                <HugeiconsIcon icon={ArrowRight} strokeWidth={2} />
              </Link>
            </div>
            <ProductGrid products={gamesData} isPending={isPendingGamesData} />
          </div>
        </div>
      </div>
      <Marquee className="py-8">
        <ProgressiveBlur
          direction="left"
          className="absolute left-0 bottom-0 z-10 h-full sm:w-36 w-24"
          blurIntensity={2}
          blurLayers={6}
        />
        <MarqueeContent speed={50} pauseOnHover={false}>
          {new Array(4).fill(null).map((_, index) => (
            <MarqueeItem
              key={index}
              className="h-14 sm:h-24 lg:h-36 sm:mx-16 mx-8"
            >
              <MaskedMarqueeItem
                bg="/background.webp"
                mask="/HYPECULT-WHITE.svg"
              />
            </MarqueeItem>
          ))}
        </MarqueeContent>
        <ProgressiveBlur
          direction="right"
          className="absolute right-0 bottom-0 z-10 h-full sm:w-36 w-24"
          blurIntensity={2}
          blurLayers={6}
        />
      </Marquee>
    </div>
  );
}
