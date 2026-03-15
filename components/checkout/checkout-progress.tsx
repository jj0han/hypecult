import { HugeiconsIcon } from "@hugeicons/react";
import { checkoutSteps } from "@/app/checkout/constants";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep: number;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-start gap-2">
      {checkoutSteps.map(({ step, label, icon: Icon }, index) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center size-8 rounded-full border-2 transition-colors",
                currentStep > step
                  ? "bg-primary border-primary text-white"
                  : currentStep >= step
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
              )}
            >
              <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-4" />
            </div>
            <span
              className={cn(
                "text-sm font-medium hidden sm:block",
                currentStep >= step
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {index < checkoutSteps.length - 1 && (
            <Separator
              className={cn(
                "w-4! sm:w-8! h-0.5!",
                currentStep > step ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
