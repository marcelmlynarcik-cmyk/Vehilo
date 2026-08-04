import "server-only";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function getAdminEmails() {
  return (process.env.VEHILO_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function getCurrentAdminState() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      authenticated: false,
      isAdmin: false,
      email: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? null;

  return {
    configured: true,
    authenticated: Boolean(user),
    isAdmin: isAdminEmail(email),
    email,
  };
}

export async function requireAdmin() {
  const adminState = await getCurrentAdminState();

  if (!adminState.authenticated) {
    redirect("/");
  }

  if (!adminState.isAdmin) {
    redirect("/dashboard");
  }

  return adminState;
}
