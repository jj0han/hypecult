"use client";
import {
  ArrowDown01Icon,
  Heart,
  Logout01Icon,
  SearchIcon,
  ShoppingCart02Icon,
  User,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import Logo from "./logo";
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
import { Spinner } from "./ui/spinner";

export default function Header() {
  const router = useRouter();
  const { cart } = useCart();
  const { user, isLoading, logOut } = useAuth();

  return (
    <header className="p-6 border-b">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}
