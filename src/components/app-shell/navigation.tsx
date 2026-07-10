import {
  BarChart3,
  Bell,
  Car,
  FileText,
  Fuel,
  Gauge,
  ReceiptText,
  Settings,
  Wrench,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", label: "Přehled", icon: Gauge },
  { href: "/vehicles", label: "Vozidla", icon: Car },
  { href: "/expenses", label: "Výdaje", icon: ReceiptText },
  { href: "/fuel-energy", label: "Palivo a energie", icon: Fuel },
  { href: "/service", label: "Servis", icon: Wrench },
  { href: "/reminders", label: "Připomínky", icon: Bell },
  { href: "/documents", label: "Dokumenty", icon: FileText },
  { href: "/statistics", label: "Statistiky", icon: BarChart3 },
  { href: "/settings", label: "Nastavení", icon: Settings },
];

export const mobileNavigationItems = [
  navigationItems[0],
  navigationItems[1],
  navigationItems[5],
  { href: "/settings", label: "Více", icon: Settings },
];
