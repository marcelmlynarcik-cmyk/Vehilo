import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function MetricCard({ title, value, description, icon: Icon }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(45,212,163,0.45)] to-transparent" />
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-1">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        <span className="flex size-9 items-center justify-center rounded-[13px] border border-[rgba(45,212,163,0.2)] bg-[rgba(45,212,163,0.1)]">
          <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="tabular-num text-2xl font-bold tracking-[-0.02em] text-white">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
