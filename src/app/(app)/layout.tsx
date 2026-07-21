import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { loadGarageData } from "@/lib/data/garage";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const garage = await loadGarageData();

  if (garage.configured && !garage.authenticated) {
    redirect("/");
  }

  return (
    <AppShell
      configured={garage.configured}
      authenticated={garage.authenticated}
      error={garage.error}
      profile={garage.data.profile}
    >
      {children}
    </AppShell>
  );
}
