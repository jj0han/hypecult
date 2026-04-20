"use client";
import {
  ArrowRight01Icon,
  Heart,
  Home01Icon,
  LockKeyIcon,
  Logout01Icon,
  Menu11Icon,
  SearchIcon,
  ShoppingCart02Icon,
  User,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import Logo from "./logo";
import { SearchSheet } from "./search-sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Skeleton } from "./ui/skeleton";
import { Spinner } from "./ui/spinner";

export default function Header() {
  const router = useRouter();
  const { cart } = useCart();
  const { logOut } = useAuth();
  const { status, data } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const user = data?.user;
  const isLoading = status === "loading";

  return (
    <>
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <header className="p-6 border-b">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            <Logo id="header-logo" />
            <div className="md:flex hidden items-center gap-2">
              <InputGroup
                className="w-full cursor-pointer"
                onClick={() => setSearchOpen(true)}
              >
                <InputGroupInput
                  placeholder="Pesquisar"
                  readOnly
                  className="cursor-pointer"
                />
                <InputGroupAddon>
                  <InputGroupButton variant="ghost">
                    <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <Button variant="ghost" size="icon">
                <HugeiconsIcon icon={Heart} strokeWidth={2} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/checkout")}
                className={"relative"}
              >
                <HugeiconsIcon icon={ShoppingCart02Icon} strokeWidth={2} />
                {cart && (
                  <Badge
                    className={
                      "absolute -top-0.5 -right-0.5 size-4 text-xs p-0"
                    }
                  >
                    {cart?.length}
                  </Badge>
                )}
              </Button>
              {user ? (
                <Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" />}
                      className={"group"}
                    >
                      <span>{user.name?.split(" ")[0]}</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        strokeWidth={2}
                        className="group-aria-expanded:rotate-90 transition-transform duration-300 ease-out"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role === "admin" && (
                        <DropdownMenuItem
                          render={<Link href={"/admin" as Route} />}
                        >
                          <HugeiconsIcon icon={LockKeyIcon} strokeWidth={2} />
                          Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem render={<Link href="/account" />}>
                        <HugeiconsIcon icon={User} strokeWidth={2} />
                        Conta
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/" />}>
                        <HugeiconsIcon icon={Heart} strokeWidth={2} />
                        Salvos
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href="/checkout" />}>
                        <HugeiconsIcon
                          icon={ShoppingCart02Icon}
                          strokeWidth={2}
                        />
                        Carrinho
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />

                      <DialogTrigger
                        render={<DropdownMenuItem variant="destructive" />}
                      >
                        <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                        Sair
                      </DialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              ) : (
                <Button
                  disabled={isLoading}
                  variant="default"
                  onClick={() => router.push("/log-in")}
                >
                  {isLoading ? <Spinner strokeWidth={3} /> : "Entrar"}
                </Button>
              )}
            </div>
            <div className="items-center space-x-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/checkout")}
                className="relative"
              >
                <HugeiconsIcon icon={ShoppingCart02Icon} strokeWidth={2} />
                {cart && (
                  <Badge
                    className={
                      "absolute -top-0.5 -right-0.5 size-4 text-xs p-0"
                    }
                  >
                    {cart?.length}
                  </Badge>
                )}
              </Button>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden" />
                }
              >
                <HugeiconsIcon icon={Menu11Icon} strokeWidth={2} />
              </SheetTrigger>
            </div>
          </div>
        </header>
        <SheetContent showCloseButton={!!user}>
          <SheetHeader>
            {user ? (
              <>
                <Avatar className="size-10">
                  <AvatarImage src={user?.image ?? undefined} />
                  <AvatarFallback>
                    <HugeiconsIcon icon={User} strokeWidth={2} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="w-2/3 h-4" />
                      <Skeleton className="w-3/4 h-4" />
                    </div>
                  ) : (
                    <>
                      <SheetTitle>{user?.name}</SheetTitle>
                      <SheetDescription>{user?.email}</SheetDescription>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 flex flex-col">
                <div className="flex flex-col w-full">
                  <div className={"sm:h-9 h-8 py-2 z-10 w-fit"}>
                    <Image
                      src="/HYPECULT.svg"
                      alt="Hypecult"
                      width={300}
                      height={300}
                      className="object-contain dark:brightness-[0.2] dark:grayscale h-full w-full"
                    />
                  </div>
                  <SheetDescription>
                    Entre com sua conta para acessar o seu carrinho e muito
                    mais!
                  </SheetDescription>
                </div>
                <Button
                  disabled={isLoading}
                  variant="default"
                  onClick={() => router.push("/log-in")}
                >
                  {isLoading ? <Spinner strokeWidth={3} /> : "Entrar"}
                </Button>
              </div>
            )}
          </SheetHeader>
          <div className="flex flex-col gap-6 no-scrollbar overflow-y-auto px-6">
            <InputGroup
              className="w-full cursor-pointer"
              onClick={() => {
                setMobileNavOpen(false);
                setSearchOpen(true);
              }}
            >
              <InputGroupInput
                placeholder="Pesquisar"
                readOnly
                className="cursor-pointer"
              />
              <InputGroupAddon>
                <InputGroupButton variant="ghost">
                  <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/")}
              >
                <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
                Início
              </Button>
              {user?.role === "admin" && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.push("/admin")}
                >
                  <HugeiconsIcon icon={LockKeyIcon} strokeWidth={2} />
                  Admin
                </Button>
              )}
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/account")}
              >
                <HugeiconsIcon icon={User} strokeWidth={2} />
                Conta
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/")}
              >
                <HugeiconsIcon icon={Heart} strokeWidth={2} />
                Salvos
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/checkout")}
              >
                <HugeiconsIcon icon={ShoppingCart02Icon} strokeWidth={2} />
                Carrinho
              </Button>
              {user && (
                <Dialog>
                  <DialogTrigger render={<Button variant="destructive" />}>
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
              )}
            </div>
          </div>
          <SheetFooter>
            <SheetClose render={<Button variant="ghost" className="w-full" />}>
              Fechar
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
