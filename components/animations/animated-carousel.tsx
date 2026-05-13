import {
  CopyIcon,
  Mouse22FreeIcons,
  Touch04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Carousel,
  type CarouselApi,
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
import { copyToClipboard } from "@/utils/helpers";

const GrainGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.GrainGradient),
  { ssr: false }
);
const Heatmap = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.Heatmap),
  { ssr: false }
);

export function AnimatedCarousel() {
  const [isActive, setIsActive] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [mountedShaders, setMountedShaders] = useState(() => new Set([0]));

  useEffect(() => {
    function handleVisibilityChange() {
      setIsActive(!document.hidden);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateSelectedSlide = () => {
      const index = api.selectedScrollSnap();

      setSelectedSlide(index);
      setMountedShaders((current) => {
        if (current.has(index)) return current;
        return new Set(current).add(index);
      });
    };

    updateSelectedSlide();
    api.on("select", updateSelectedSlide);
    api.on("reInit", updateSelectedSlide);

    return () => {
      api.off("select", updateSelectedSlide);
      api.off("reInit", updateSelectedSlide);
    };
  }, [api]);

  const autoplay = useMemo(() => {
    return Autoplay({
      active: isActive,
      delay: 10000,
    });
  }, [isActive]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ active: isActive, loop: true }}
      plugins={[autoplay]}
    >
      <CarouselContent>
        <CarouselItem>
          {mountedShaders.has(0) && (
            <div className="bg-foreground m-6 rounded-4xl relative overflow-hidden h-[calc(100svh-131px)]">
              <div
                key={`slide-0-motion-${selectedSlide}`}
                className="absolute inset-0 flex flex-col space-y-4 justify-center items-center p-6"
              >
                <motion.h1
                  animate={{
                    y: [-100, 0],
                    opacity: [0, 1],
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                      delay: 0.2,
                    },
                  }}
                  className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem] 2xl:text-[20rem] font-extrabold text-background z-0 uppercase"
                >
                  Hypecult.
                </motion.h1>
                <motion.h2
                  animate={{
                    y: [-100, 0],
                    opacity: [0, 0.9],
                    transition: {
                      duration: 0.7,
                      delay: 0.3,
                      ease: "easeOut",
                    },
                  }}
                  className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-background z-10"
                >
                  Evento de Lançamento
                </motion.h2>
                <motion.form
                  animate={{
                    y: [-100, 0],
                    opacity: [0, 0.9],
                    transition: {
                      duration: 0.7,
                      delay: 0.3,
                      ease: "easeOut",
                    },
                  }}
                  className="z-10 mt-16 flex flex-col items-center gap-4"
                >
                  <Label
                    htmlFor="coupon-code"
                    className="text-background text-center text-sm md:text-lg z-10 text-shadow-md"
                  >
                    10% de Desconto na sua primeira compra com o código:
                  </Label>
                  <InputGroup className="w-52 h-auto">
                    <InputGroupInput
                      id="coupon-code"
                      defaultValue="WELCOME10"
                      readOnly
                      className="text-background text-lg! md:text-xl! font-bold text-center tracking-wide"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        title="Copiar código de cupom"
                        size="icon-sm"
                        variant="default"
                        onClick={async () =>
                          await copyToClipboard("WELCOME10")
                            .finally(() => {
                              toast.success("Código de cupom copiado");
                            })
                            .catch(() => {
                              toast.error("Erro ao copiar cupom");
                            })
                        }
                      >
                        <HugeiconsIcon icon={CopyIcon} strokeWidth={2} />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </motion.form>
              </div>
              <motion.div
                animate={{
                  y: [200, 0],
                  transition: {
                    duration: 0.7,
                    delay: 0.3,
                    ease: "easeInOut",
                  },
                }}
                className="absolute h-full w-full right-0 top-0"
              >
                <Image
                  alt=""
                  src={"/editor_front-removebg-preview.webp"}
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
                speed={selectedSlide === 0 && isActive ? 1 : 0}
                fit="cover"
                width={"100%"}
                height={"100%"}
              />
            </div>
          )}
        </CarouselItem>
        <CarouselItem>
          {mountedShaders.has(1) && (
            <div className="bg-foreground m-6 rounded-4xl relative overflow-hidden h-[calc(100svh-131px)]">
              <div
                key={`slide-1-motion-${selectedSlide}`}
                className="absolute inset-0 flex flex-col space-y-4 justify-between items-start p-6"
              >
                <motion.h1
                  animate={{
                    x: [-1000, 0],
                    opacity: [0, 1],
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                      delay: 0.2,
                    },
                  }}
                  className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-background uppercase"
                >
                  Coleção <br /> Elden Ring
                </motion.h1>
                <motion.h2
                  animate={{
                    x: [1000, 0],
                    opacity: [0, 0.9],
                    transition: {
                      duration: 0.7,
                      delay: 0.3,
                      ease: "easeOut",
                    },
                  }}
                  className="self-end text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-background z-10"
                >
                  Great Runes
                </motion.h2>
              </div>
              <Heatmap
                width={"100%"}
                height={"100%"}
                image="/eldenring.png"
                colors={[
                  "#efb02a",
                  "#ffffff",
                  "#ebf0ff",
                  "#ffffff",
                  "#ffe77a",
                  "#ff9a1f",
                  "#ff4d00",
                  "#9933cc",
                ]}
                colorBack="#00000000"
                contour={1}
                angle={0}
                noise={0}
                innerGlow={1}
                outerGlow={0.25}
                speed={selectedSlide === 1 && isActive ? 0.66 : 0}
                suspendWhenProcessingImage={false}
                scale={0.5}
                fit="contain"
              />
            </div>
          )}
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
  );
}
