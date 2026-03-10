"use client";
import { ChevronLeft, Shield } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="w-full mx-auto flex flex-col gap-6">
          <Header />
          {children}
        </div>
      </div>
    </div>
  );
}

function Header() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-3 items-center">
      <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
        <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
      </Button>
      <div className="flex justify-center">
        <Logo id="header-logo" />
      </div>
      <Badge variant="outline" className="justify-self-end md:flex hidden">
        <HugeiconsIcon icon={Shield} strokeWidth={2} />
        Segurança SSL
      </Badge>
    </div>
  );
}
