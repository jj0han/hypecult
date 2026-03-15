import { LogIn, User } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StepIdentificationProps {
  onLogin: () => void;
}

export function StepIdentification({ onLogin }: StepIdentificationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={User} strokeWidth={2} className="size-5" />
          Identificação
        </CardTitle>
        <CardDescription className="text-base inline-flex items-center gap-2">
          Entre ou crie sua conta
          <Image
            src="/HYPECULT.svg"
            alt="Hypecult"
            width={80}
            height={80}
            className="object-contain mt-1"
          />
          para continuar com a compra.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onLogin} size="lg" className="w-full sm:w-auto">
          <HugeiconsIcon icon={LogIn} strokeWidth={2} className="size-4" />
          Entrar ou criar conta
        </Button>
      </CardFooter>
    </Card>
  );
}
