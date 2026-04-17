"use client";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const router = useRouter();
  return (
    <footer className="flex flex-col items-center gap-6 py-6 border-t">
      <div className="flex flex-col items-center justify-between gap-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center font-medium h-10">
          <Image
            src="/HYPECULT.svg"
            alt="Hypecult"
            width={150}
            height={150}
            className="object-contain"
          />
        </Link>
        <ul className="flex items-center gap-4">
          <li>
            <Button variant="ghost" size="lg" onClick={() => router.push("/")}>
              Produtos
            </Button>
          </li>
          <li>
            <Button variant="ghost" size="lg" onClick={() => router.push("/")}>
              Sobre
            </Button>
          </li>
          <li>
            <Button variant="ghost" size="lg" onClick={() => router.push("/")}>
              Contato
            </Button>
          </li>
        </ul>
      </div>
      <Separator />
      <div className="px-6 w-full">
        <div className="flex flex-col gap-4 sm:flex-row items-center justify-between max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground">
            © 2026 Hypecult. Todos os direitos reservados.
          </p>
          <ul className="flex flex-wrap justify-center sm:justify-end items-center gap-1">
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/policies/privacy-policy" as Route)}
              >
                Privacidade
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/policies/terms-of-use" as Route)}
              >
                Termos de Uso
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push("/policies/shipping-policy" as Route)
                }
              >
                Envio e entrega
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/policies/refund-policy" as Route)}
              >
                Trocas e reembolsos
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/policies/cookie-policy" as Route)}
              >
                Cookies
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
