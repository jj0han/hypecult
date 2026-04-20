"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type QuickAccessCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  badgeLabel?: string | ReactNode;
  cta: string;
  className?: string;
};

export function QuickAccessCard({
  href,
  title,
  description,
  icon,
  badgeLabel,
  cta,
  className,
}: QuickAccessCardProps) {
  return (
    <Link href={href as Route} className={className}>
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
              {title}
            </CardTitle>
            {badgeLabel !== undefined && badgeLabel !== null && (
              <Badge variant="secondary" className="size-5 p-0">
                {badgeLabel}
              </Badge>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {cta}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
