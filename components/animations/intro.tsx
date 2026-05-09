/** biome-ignore-all lint/suspicious/noArrayIndexKey: we need to use the index as a key */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";

export function Intro({ onComplete }: { onComplete: () => void }) {
  const introRootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stagger = 0.08;
      const scaleFactor = 1.63;

      const headerLogo = document.getElementById("header-logo");
      const logoAnimEl = document.getElementById("logo-anim");

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
      if (!session) {
        tl.timeScale(1.35);
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
      }
    },
    { scope: introRootRef }
  );

  if (typeof window === "undefined") return null;

  const session = sessionStorage.getItem("intro-completed");

  if (session) return null;

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
              id="logo-anim"
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
