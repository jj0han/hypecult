"use client";
import {
  ArrowDown01Icon,
  Heart,
  Home01Icon,
  Logout01Icon,
  Menu11Icon,
  SearchIcon,
  ShoppingCart02Icon,
  User,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
  const { user, isLoading, logOut } = useAuth();

  return (
    <Sheet>
      <header className="p-6 border-b">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <Logo id="header-logo" />
          <div className="md:flex hidden items-center gap-2">
            <InputGroup className="w-full">
              <InputGroupInput placeholder="Pesquisar" />
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
                  className={"absolute -top-0.5 -right-0.5 size-4 text-xs p-0"}
                >
                  {cart?.length}
                </Badge>
              )}
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost">
                      <HugeiconsIcon icon={User} strokeWidth={2} />
                      {user.name?.split(" ")[0]}
                      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    render={
                      <Link href="/account">
                        <HugeiconsIcon icon={User} strokeWidth={2} />
                        Conta
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/favorites">
                        <HugeiconsIcon icon={Heart} strokeWidth={2} />
                        Salvos
                      </Link>
                    }
                  />
                  <DropdownMenuItem
                    render={
                      <Link href="/checkout">
                        <HugeiconsIcon
                          icon={ShoppingCart02Icon}
                          strokeWidth={2}
                        />
                        Carrinho
                      </Link>
                    }
                  />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => logOut.mutate()}
                  >
                    <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  className={"absolute -top-0.5 -right-0.5 size-4 text-xs p-0"}
                >
                  {cart?.length}
                </Badge>
              )}
            </Button>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <HugeiconsIcon icon={Menu11Icon} strokeWidth={2} />
                </Button>
              }
            />
          </div>
        </div>
      </header>
      <SheetContent>
        <SheetHeader>
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
        </SheetHeader>
        <div className="flex flex-col gap-6 no-scrollbar overflow-y-auto px-4">
          <InputGroup className="w-full">
            <InputGroupInput placeholder="Pesquisar" />
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
              onClick={() => router.push("/favorites")}
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
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => logOut.mutate()}
            >
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
              Sair
            </Button>
          </div>
        </div>
        <SheetFooter>
          <SheetClose
            render={
              <Button variant="ghost" className="w-full">
                Fechar
              </Button>
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
