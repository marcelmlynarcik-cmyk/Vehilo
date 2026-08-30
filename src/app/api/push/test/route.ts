import { sendTestPushNotification } from "@/lib/push/reminder-delivery";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const context = await requireAuthenticatedPushContext();

  if (context instanceof Response) {
    return context;
  }

  const endpoint = await parseEndpoint(request);

  if (endpoint instanceof Response) {
    return endpoint;
  }

  const { data: subscription, error } = await context.supabase
    .from("push_subscriptions")
    .select("id,subscription")
    .eq("user_id", context.userId)
    .eq("endpoint", endpoint)
    .eq("enabled", true)
    .single();

  if (error || !subscription) {
    return Response.json({ error: "Push notifikace nejsou na tomto zařízení zapnuté." }, { status: 404 });
  }

  const result = await sendTestPushNotification(subscription.subscription);

  if (result.expired) {
    await context.supabase.from("push_subscriptions").update({ enabled: false }).eq("id", subscription.id);
  }

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.expired ? 410 : 500 });
  }

  return Response.json({ ok: true });
}

async function requireAuthenticatedPushContext() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return Response.json({ error: "Supabase není nakonfigurovaný." }, { status: 503 });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: "Pro test push notifikace se musíte přihlásit." }, { status: 401 });
  }

  return { supabase, userId: user.id };
}

async function parseEndpoint(request: Request) {
  const body = await parseJson(request);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";

  if (!endpoint) {
    return Response.json({ error: "Chybí endpoint push subscription." }, { status: 400 });
  }

  return endpoint;
}

async function parseJson(request: Request) {
  try {
    const body: unknown = await request.json();
    return isRecord(body) ? body : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
