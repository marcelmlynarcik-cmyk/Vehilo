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
};

const emptySeries: ChartDatum[] = [{ name: "Bez dat", value: 0 }];
const chartColors = ["#2dd4a3", "#38bdf8", "#f6b93b", "#a78bfa", "#fb7185"];
const axisStyle = { fill: "#73808c", fontSize: 12 };
const tooltipStyle = {
  background: "#0d171e",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  borderRadius: "14px",
  color: "#f8fafc",
  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.32)",
};

interface ChartCardProps {
  title: string;
  type: "line" | "bar" | "pie" | "area";
  data?: ChartDatum[];
  emptyLabel?: string;
}

export function ChartCard({ title, type, data, emptyLabel = "Zatím bez dat" }: ChartCardProps) {
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
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(45, 212, 163, 0.2)" }} />
              <Line type="monotone" dataKey="value" stroke="#2dd4a3" strokeWidth={3} dot={false} />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(56, 189, 248, 0.08)" }} />
              <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={chartData}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisStyle} />
              <YAxis tickLine={false} axisLine={false} tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(45, 212, 163, 0.2)" }} />
              <Area type="monotone" dataKey="value" stroke="#2dd4a3" strokeWidth={3} fill="#2dd4a3" fillOpacity={0.18} />
            </AreaChart>
          ) : (
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
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
