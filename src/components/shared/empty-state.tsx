import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-[rgba(148,163,184,0.24)]">
      <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-[18px] border border-[rgba(45,212,163,0.2)] bg-[rgba(45,212,163,0.1)]">
          <Icon className="size-7 text-[var(--accent)]" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        {actionLabel ? (
          <Button className="mt-5" type="button">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
