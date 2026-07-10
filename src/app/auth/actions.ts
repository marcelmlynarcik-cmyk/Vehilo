"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/?auth=missing-supabase");
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "http://localhost:3000";

  const normalizedSiteUrl = siteUrl.startsWith("http")
    ? siteUrl
    : `https://${siteUrl}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${normalizedSiteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/?auth=google-error");
  }

  redirect(data.url);
}
