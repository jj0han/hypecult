import Image from "next/image";
import Logo from "@/components/logo";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <div className="bg-[url('/background.webp')] bg-cover bg-center grayscale brightness-75 absolute inset-0 blur-xs scale-110" />
        <Image
          src="/HYPECULT-WHITE.svg"
          alt="Login"
          fill
          className="object-contain dark:brightness-[0.2] dark:grayscale scale-95"
        />
      </div>
    </div>
  );
}
