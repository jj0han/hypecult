"use client";

import { motion, useMotionValue } from "motion/react";
import type { HTMLAttributes } from "react";
import { useEffect, useRef } from "react";
import type { MarqueeProps as FastMarqueeProps } from "react-fast-marquee";
import FastMarquee from "react-fast-marquee";
import { cn } from "@/lib/utils";

type Props = {
  bg: string;
  mask: string;
};

export type MarqueeProps = HTMLAttributes<HTMLDivElement>;

export const Marquee = ({ className, ...props }: MarqueeProps) => (
  <div
    className={cn("relative w-full overflow-hidden", className)}
    {...props}
  />
);

export type MarqueeContentProps = FastMarqueeProps;

export const MarqueeContent = ({
  loop = 0,
  autoFill = true,
  pauseOnHover = true,
  ...props
}: MarqueeContentProps) => (
  <FastMarquee
    loop={loop}
    autoFill={autoFill}
    pauseOnHover={pauseOnHover}
    {...props}
  />
);

export type MarqueeFadeProps = HTMLAttributes<HTMLDivElement> & {
  side: "left" | "right";
};

export const MarqueeFade = ({
  className,
  side,
  ...props
}: MarqueeFadeProps) => (
  <div
    className={cn(
      "absolute top-0 bottom-0 z-10 h-full w-24 from-background to-transparent",
      side === "left" ? "left-0 bg-linear-to-r" : "right-0 bg-linear-to-l",
      className
    )}
    {...props}
  />
);

export type MarqueeItemProps = HTMLAttributes<HTMLDivElement>;

export const MarqueeItem = ({ className, ...props }: MarqueeItemProps) => (
  <div className={cn("mx-2 shrink-0 object-contain", className)} {...props} />
);

export function MaskedMarqueeItem({ bg, mask }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const bgX = useMotionValue(0);
  const bgY = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;

    const update = () => {
      const rect = el.getBoundingClientRect();

      // compensação do movimento
      bgX.set(-rect.left);
      bgY.set(-rect.top);

      raf = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(raf);
  }, [bgX, bgY]);

  return (
    <motion.div
      ref={ref}
      className="h-full aspect-587/59"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundPositionX: bgX,
        backgroundPositionY: bgY,
        filter: "blur(4px) brightness(0.5)",

        WebkitMaskImage: `url(${mask})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "center",

        maskImage: `url(${mask})`,
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "center",
      }}
    />
  );
}
