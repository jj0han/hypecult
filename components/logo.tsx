import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <motion.div
      layoutId="logo-motion"
      layout="position"
      className={cn("h-8 p-2", className)}
    >
      <Link href={"/"}>
        <Image
          src="/HYPECULT.svg"
          alt="Hypecult"
          width={300}
          height={300}
          className="object-contain dark:brightness-[0.2] dark:grayscale h-full w-full"
        />
      </Link>
    </motion.div>
  );
}
