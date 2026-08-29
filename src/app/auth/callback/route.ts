import { NextResponse, type NextRequest } from "next/server";
import { notifyNewUser } from "@/lib/new-user-notification";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { data } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { data: null };

    if (data?.user) {
      await notifyNewUser(data.user);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
