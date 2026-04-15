"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      id={id}
      layoutId="logo-motion"
      layout="position"
      className={cn("sm:h-9 h-8 py-2 z-10", className)}
    >
      <Link href={"/"}>
        <Image
          src="/HYPECULT.svg"
          alt="Hypecult"
          width={300}
          height={300}
          className="object-contain h-full w-full"
        />
      </Link>
    </motion.div>
  );
}
