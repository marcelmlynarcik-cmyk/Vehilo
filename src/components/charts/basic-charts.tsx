"use client";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative h-[260px] md:h-72">
        {!hasData ? (
          <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 rounded-[16px] border border-dashed border-border bg-[rgba(8,17,23,0.74)] px-4 py-3 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis width={54} tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} />} cursor={{ stroke: "rgba(45, 212, 163, 0.2)" }} position={{ x: 8, y: 8 }} />
              <Line type="monotone" dataKey="value" name={valueLabel} stroke="#2dd4a3" strokeWidth={3} dot={false} />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis width={54} tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} />} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} position={{ x: 8, y: 8 }} />
              <Bar dataKey="value" name={valueLabel} fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis width={54} tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} />} cursor={{ stroke: "rgba(45, 212, 163, 0.2)" }} position={{ x: 8, y: 8 }} />
              <Area type="monotone" dataKey="value" name={valueLabel} stroke="#2dd4a3" strokeWidth={3} fill="#2dd4a3" fillOpacity={0.18} />
            </AreaChart>
          ) : (
            <PieChart>
              <Tooltip wrapperStyle={{ pointerEvents: "auto" }} content={<ChartTooltip valueLabel={valueLabel} />} position={{ x: 8, y: 8 }} />
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>
                {chartData.map((entry, index) => (
                  <Cell key={String(entry.name)} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({
  active,
  label,
  payload,
  valueLabel,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number | string; name?: string; payload?: ChartDatum }>;
  valueLabel: string;
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
    >
      <div className="font-semibold">{label ?? point?.name}</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {valueLabel}: <span className="tabular-num text-foreground">{value}{point?.unit ? ` ${point.unit}` : ""}</span>
      </div>
      {details.length > 0 ? (
        <div className="pointer-events-auto mt-3 max-h-44 touch-pan-y space-y-1 overflow-y-auto overscroll-contain border-t border-border pt-2 [scrollbar-width:thin]">
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
