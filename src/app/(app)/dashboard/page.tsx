import {
  Bell,
  CalendarClock,
  Car,
  FileText,
  Fuel,
  Gauge,
  ReceiptText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartCard } from "@/components/charts/basic-charts";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { loadGarageData } from "@/lib/data/garage";
import {
  calculateAverageMonthlyCost,
  calculateCostPerKm,
  calculateTotalOwnershipCost,
  countReminderStatus,
  formatCurrency,
  formatNumber,
  totalMileage,
} from "@/lib/calculations/costs";

export default async function DashboardPage() {
  const { data } = await loadGarageData();
  const totalCost = calculateTotalOwnershipCost(data);
  const monthlyCost = calculateAverageMonthlyCost(data);
  const costPerKm = calculateCostPerKm(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back to Vehilo"
        description="Track costs, maintenance, fuel, energy and reminders for all your vehicles in one place."
        actions={
          <>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All vehicles</SelectItem>
                {data.vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>Add Vehicle</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total vehicles" value={String(data.vehicles.length)} description="Active garage records" icon={Car} />
        <MetricCard title="Monthly cost" value={formatCurrency(monthlyCost)} description="Average from real records" icon={ReceiptText} />
        <MetricCard title="Lifetime ownership cost" value={formatCurrency(totalCost)} description="Expenses, energy, service and depreciation" icon={Gauge} />
        <MetricCard title="Cost per kilometer" value={`${costPerKm.toFixed(2)} EUR/km`} description="Across all vehicles" icon={Fuel} />
        <MetricCard title="Upcoming reminders" value={String(countReminderStatus(data.reminders, "upcoming"))} description="Planned maintenance and documents" icon={Bell} />
        <MetricCard title="Overdue reminders" value={String(countReminderStatus(data.reminders, "overdue"))} description="Needs attention" icon={CalendarClock} />
        <MetricCard title="Documents expiring soon" value={String(data.documents.filter((document) => document.status === "expiring_soon").length)} description="Insurance, STK/MOT and permits" icon={FileText} />
        <MetricCard title="Current total mileage" value={`${formatNumber(totalMileage(data.vehicles))} km`} description="Sum of tracked vehicle mileage" icon={Gauge} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Monthly spending" type="bar" />
        <ChartCard title="Expense breakdown by category" type="pie" />
        <ChartCard title="Cumulative ownership cost" type="area" />
        <ChartCard title="Fuel / energy cost trend" type="line" />
        <ChartCard title="Consumption trend" type="line" />
        <ChartCard title="Expense breakdown by vehicle" type="bar" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          "Your average monthly cost will appear after your first real expense.",
          "Fuel and energy share will be calculated from Supabase records.",
          "Your next urgent reminder will be shown after reminders are created.",
        ].map((insight) => (
          <Card key={insight}>
            <CardContent className="p-5">
              <Badge variant="secondary" className="mb-3">Vehilo Insight</Badge>
              <p className="text-sm text-muted-foreground">{insight}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Install Vehilo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Add Vehilo to your home screen for faster access to your garage.
          </p>
          <Button variant="outline">Install app</Button>
        </CardContent>
      </Card>
    </div>
  );
}
