"use client";
import {
  ArrowLeft01Icon,
  GridViewIcon,
  Logout01Icon,
  MapPin,
  ShoppingBag,
  User,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import {
  usePathname,
  useRouter,
  useSelectedLayoutSegments,
} from "next/navigation";
import { useSession } from "next-auth/react";
import { Fragment } from "react/jsx-runtime";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";

const accountLinks = [
  {
    href: "/account",
    label: "Visão geral",
    icon: GridViewIcon,
  },
  {
    href: "/account/orders",
    label: "Meus pedidos",
    icon: ShoppingBag,
  },
  {
    href: "/account/addresses",
    label: "Meus endereços",
    icon: MapPin,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, status } = useSession();
  const { logOut } = useAuth();
  const pathname = usePathname();
  const segments = useSelectedLayoutSegments();
  const router = useRouter();

  return (
    <Fragment>
      <Header />
      <div className="px-6 py-8 min-h-svh">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              <h1 className="text-2xl font-bold">Minha conta</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seus pedidos, endereços e dados de compra.
              </p>
            </div>
            <div className="lg:col-span-2 flex items-end gap-2 w-full">
              {segments.length > 1 && (
                <Button variant="outline" onClick={() => router.back()}>
                  <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                  Voltar
                </Button>
              )}
            </div>
            <aside className="lg:col-span-1">
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-4">
                    <Avatar className="size-10">
                      <AvatarImage src={data?.user?.image ?? undefined} />
                      <AvatarFallback>
                        <HugeiconsIcon icon={User} strokeWidth={2} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full">
                      {status === "loading" ? (
                        <div className="space-y-2">
                          <Skeleton className="w-2/3 h-4" />
                          <Skeleton className="w-3/4 h-4" />
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium">
                            {data?.user?.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {data?.user?.email}
                          </span>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {accountLinks.map(({ href, label, icon }) => {
                    const isActive =
                      href === "/account"
                        ? pathname === href
                        : pathname.startsWith(href);

                    return (
                      <Button
                        key={href}
                        variant={isActive ? "secondary" : "ghost"}
                        size="lg"
                        className="justify-start w-full"
                        onClick={() => router.push(href as Route)}
                      >
                        <HugeiconsIcon icon={icon} strokeWidth={2} />
                        <span>{label}</span>
                      </Button>
                    );
                  })}
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button
                          variant="link"
                          size="lg"
                          className="justify-start w-full"
                        />
                      }
                    >
                      <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                      Sair
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Desconectar</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja sair?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose render={<Button variant="secondary" />}>
                          Cancelar
                        </DialogClose>
                        <DialogClose
                          render={
                            <Button
                              variant="destructive"
                              onClick={() => logOut.mutate()}
                            />
                          }
                        >
                          Sair
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </aside>

            <section className="lg:col-span-2">{children}</section>
          </div>
        </div>
      </div>
      <Footer />
    </Fragment>
  );
}
