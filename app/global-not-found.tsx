// Import global styles and fonts
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 - Página não encontrada | Hypecult",
  description: "A página que você está procurando não existe.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${outfit.variable} no-scrollbar scroll-smooth`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center gap-8">
              <Link href={"/"}>
                <Image
                  src="/HYPECULT.svg"
                  alt="Hypecult"
                  width={300}
                  height={300}
                  className="object-contain h-full w-full"
                />
              </Link>
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold">
                  404 - Página não encontrada
                </h1>
                <p className="text-lg text-muted-foreground">
                  A página que você está procurando não existe.
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                render={<Link href={"/"}>Voltar para a página inicial</Link>}
              />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
