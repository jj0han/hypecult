/** biome-ignore-all lint/suspicious/noArrayIndexKey: we need to use the index as a key */
"use client";
import {
  ArrowRight,
  CopyIcon,
  Mouse22FreeIcons,
  Touch04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Dithering, GrainGradient } from "@paper-design/shaders-react";
import { useQuery } from "@tanstack/react-query";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "motion/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MaskedMarqueeItem,
} from "@/components/ui/marquee";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { useTRPC } from "@/lib/trpc";
import { useEffect, useState } from "react";

export default function Page() {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.product.list.queryOptions());
  const { data: japaneseMusicData, isPending: isPendingJapaneseMusicData } =
    useQuery(
      trpc.product.list.queryOptions({
        subcategoryIds: ["fa9a39c3-9a1a-4d0b-8b01-98403419df85"],
      }),
    );
  const { data: gamesData, isPending: isPendingGamesData } = useQuery(
    trpc.product.list.queryOptions({
      subcategoryIds: ["e7bf922b-3c76-48ac-afb2-4fed371642ef"],
    }),
  );
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsActive(!document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-svh">
      <Carousel
        opts={{ active: isActive, loop: true }}
        plugins={[
          Autoplay({
            active: isActive,
            delay: 10000,
          }),
        ]}
      >
        <CarouselContent>
          <CarouselItem>
            <div className="bg-foreground m-6 rounded-4xl relative overflow-hidden h-[calc(100vh-131px)]">
              <div className="absolute inset-0 flex flex-col space-y-4 justify-center items-center p-6">
                <motion.h1
                  animate={{
                    y: [-100, 0],
                    opacity: [0, 1],
                    transition: { duration: 0.7, ease: "easeOut" },
                  }}
                  className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem] 2xl:text-[20rem] font-extrabold text-background z-0 uppercase"
                >
                  Hypecult.
                </motion.h1>
                <motion.h2
                  animate={{
                    y: [-100, 0],
                    opacity: [0, 0.9],
                    transition: { duration: 0.7, delay: 0.1, ease: "easeOut" },
                  }}
                  className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-background z-10"
                >
                  Evento de Lançamento
                </motion.h2>
                <motion.div
                  animate={{
                    y: [-100, 0],
                    opacity: [0, 0.9],
                    transition: { duration: 0.7, delay: 0.1, ease: "easeOut" },
                  }}
                  className="z-10 mt-16 flex flex-col items-center gap-4"
                >
                  <Label className="text-background text-center text-sm md:text-lg z-10 text-shadow-2xs">
                    10% de Desconto na sua primeira compra com o código:
                  </Label>
                  <InputGroup className="w-52 h-auto">
                    <InputGroupInput
                      defaultValue="WELCOME10"
                      readOnly
                      className="text-background text-lg! md:text-xl! font-bold text-center tracking-wide"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton size="icon-sm" variant="default">
                        <HugeiconsIcon icon={CopyIcon} strokeWidth={2} />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </motion.div>
              </div>
              <motion.div
                animate={{
                  y: [200, 0],
                  transition: { duration: 0.7, delay: 0.1, ease: "easeInOut" },
                }}
                className="absolute h-full w-full right-0 top-0"
              >
                <Image
                  alt=""
                  src={"/editor_front-removebg-preview.png"}
                  fill
                  fetchPriority="high"
                  className="object-contain grayscale contrast-200"
                />
              </motion.div>
              <GrainGradient
                colors={["#c70035", "#ff8ff4db", "#adceffdb"]}
                colorBack="#00000000"
                softness={0.5}
                intensity={0.4}
                noise={0.25}
                shape="corners"
                speed={1}
                fit="cover"
                width={"100%"}
                height={"100%"}
              />
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="bg-foreground m-6 rounded-4xl relative overflow-hidden h-[calc(100vh-131px)]">
              <Dithering
                width={"100%"}
                height={"100%"}
                fit="cover"
                colorBack="#000000"
                colorFront="#a9ae56"
                shape="warp"
                type="4x4"
                size={2.5}
                speed={0.15}
                scale={0.84}
              />
            </div>
          </CarouselItem>
        </CarouselContent>
        <div className="absolute bottom-12 left-1/2 z-50 text-muted-foreground flex flex-col items-center -translate-x-1/2">
          <HugeiconsIcon
            icon={Mouse22FreeIcons}
            strokeWidth={2}
            className="animate-bounce hidden md:block"
          />
          <div className="animate-bounce md:hidden">
            <HugeiconsIcon
              icon={Touch04Icon}
              strokeWidth={2}
              className="-rotate-45"
            />
          </div>
          <span>Scroll</span>
        </div>
      </Carousel>
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
                bg="/background.png"
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
