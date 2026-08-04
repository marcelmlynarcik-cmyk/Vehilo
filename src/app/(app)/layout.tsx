import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentAdminState } from "@/lib/admin";
import { loadGarageData } from "@/lib/data/garage";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const garage = await loadGarageData();
  const adminState = await getCurrentAdminState();

  if (garage.configured && !garage.authenticated) {
    redirect("/");
  }

  return (
    <AppShell
      configured={garage.configured}
      authenticated={garage.authenticated}
      error={garage.error}
      isAdmin={adminState.isAdmin}
      profile={garage.data.profile}
    >
      {children}
    </AppShell>
  );
}
