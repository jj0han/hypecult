import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-6 py-6 border-t">
      <div className="flex flex-col items-center justify-between gap-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center font-medium h-10">
          <Image
            src="/HYPECULT.svg"
            alt="Hypecult"
            width={150}
            height={150}
            className="object-contain dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <ul className="flex items-center gap-4">
          <li>
            <Button variant="ghost" size="lg" render={<Link href="/" />}>
              Produtos
            </Button>
          </li>
          <li>
            <Button variant="ghost" size="lg" render={<Link href="/" />}>
              Sobre
            </Button>
          </li>
          <li>
            <Button variant="ghost" size="lg" render={<Link href="/" />}>
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
                render={<Link href={"/policies/privacy-policy" as Route} />}
              >
                Privacidade
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={"/policies/terms-of-use" as Route} />}
              >
                Termos de Uso
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={"/policies/shipping-policy" as Route} />}
              >
                Envio e entrega
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={"/policies/refund-policy" as Route} />}
              >
                Trocas e reembolsos
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={"/policies/cookie-policy" as Route} />}
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
