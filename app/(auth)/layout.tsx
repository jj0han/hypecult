import { MeshGradient } from "@paper-design/shaders-react";
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
        <MeshGradient
          width={"100%"}
          height={"100%"}
          fit="contain"
          colors={["#000000", "#0a0024", "#c93636", "#9c2121"]}
          grainMixer={0.1}
          grainOverlay={0.2}
          speed={0.5}
        />
      </div>
    </div>
  );
}
