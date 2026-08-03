"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartDatum = {
  name: string;
  value: number;
  unit?: string;
  details?: string[];
};

const emptySeries: ChartDatum[] = [{ name: "Bez dat", value: 0 }];
const chartColors = ["#2dd4a3", "#38bdf8", "#f6b93b", "#a78bfa", "#fb7185"];
const axisStyle = { fill: "#73808c", fontSize: 12 };

interface ChartCardProps {
  title: string;
  type: "line" | "bar" | "pie" | "area";
  data?: ChartDatum[];
  emptyLabel?: string;
  valueLabel?: string;
}

export function ChartCard({ title, type, data, emptyLabel = "Zatím bez dat", valueLabel = "Hodnota" }: ChartCardProps) {
  const chartData = data && data.length > 0 ? data : emptySeries;
  const hasData = chartData !== emptySeries;
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const tooltipActive = tooltipDismissed ? false : undefined;

  useEffect(() => {
    function dismissOnOutsidePointer(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && !cardRef.current?.contains(target)) {
        setTooltipDismissed(true);
      }
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTooltipDismissed(true);
      }
    }

    document.addEventListener("pointerdown", dismissOnOutsidePointer);
    document.addEventListener("keydown", dismissOnEscape);

    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsidePointer);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, []);

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative h-[260px] md:h-72" onPointerDownCapture={() => setTooltipDismissed(false)}>
        {!hasData ? (
          <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-[16px] border border-dashed border-border bg-[rgba(8,17,23,0.74)] px-4 py-3 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : null}
        {type === "pie" ? (
          <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip active={tooltipActive} trigger="click" wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} onDismiss={() => setTooltipDismissed(true)} />} position={{ x: 8, y: 8 }} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={2}>
                  {chartData.map((entry, index) => (
                    <Cell key={String(entry.name)} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {hasData ? <PieLegend data={chartData} /> : null}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
            <LineChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis width={54} tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip active={tooltipActive} trigger="click" wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} onDismiss={() => setTooltipDismissed(true)} />} cursor={{ stroke: "rgba(45, 212, 163, 0.2)" }} position={{ x: 8, y: 8 }} />
              <Line type="monotone" dataKey="value" name={valueLabel} stroke="#2dd4a3" strokeWidth={3} dot={false} />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis width={54} tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip active={tooltipActive} trigger="click" wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} onDismiss={() => setTooltipDismissed(true)} />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} position={{ x: 8, y: 8 }} />
              <Bar dataKey="value" name={valueLabel} fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis width={54} tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip active={tooltipActive} trigger="click" wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} onDismiss={() => setTooltipDismissed(true)} />} cursor={{ stroke: "rgba(45, 212, 163, 0.2)" }} position={{ x: 8, y: 8 }} />
              <Area type="monotone" dataKey="value" name={valueLabel} stroke="#2dd4a3" strokeWidth={3} fill="#2dd4a3" fillOpacity={0.18} />
            </AreaChart>
            ) : null}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function PieLegend({ data }: { data: ChartDatum[] }) {
  return (
    <div className="grid max-h-20 min-h-0 grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto pr-1 text-xs text-muted-foreground [scrollbar-width:thin]">
      {data.map((entry, index) => (
        <div key={String(entry.name)} className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: chartColors[index % chartColors.length] }}
            aria-hidden="true"
          />
          <span className="min-w-0 truncate" title={entry.name}>
            {entry.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({
  active,
  label,
  payload,
  valueLabel,
  onDismiss,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number | string; name?: string; payload?: ChartDatum }>;
  valueLabel: string;
  onDismiss: () => void;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  const value = payload[0]?.value ?? point?.value ?? 0;
  const details = point?.details ?? [];

  return (
    <div
      className="pointer-events-auto max-w-[min(280px,calc(100vw-2rem))] rounded-[14px] border border-[rgba(148,163,184,0.22)] bg-[#0d171e] p-3 text-sm text-[#f8fafc] shadow-[0_18px_45px_rgba(0,0,0,0.32)] sm:max-w-[320px]"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 font-semibold">{label ?? point?.name}</div>
        <button
          type="button"
          aria-label="Zavřít tooltip"
          className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onDismiss}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {valueLabel}: <span className="tabular-num text-foreground">{value}{point?.unit ? ` ${point.unit}` : ""}</span>
      </div>
      {details.length > 0 ? (
        <div
          className="pointer-events-auto mt-3 max-h-44 touch-pan-y space-y-1 overflow-y-auto overscroll-contain border-t border-border pt-2 [scrollbar-width:thin]"
          onPointerMove={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          {details.map((detail, index) => (
            <div key={`${detail}-${index}`} className="text-xs leading-snug text-muted-foreground">
              {detail}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
