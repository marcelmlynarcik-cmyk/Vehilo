import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  const context = await requireAuthenticatedPushContext();

  if (context instanceof Response) {
    return context;
  }

  const subscription = await parsePushSubscription(request);

  if (subscription instanceof Response) {
    return subscription;
  }

  const { error } = await context.supabase.from("push_subscriptions").upsert(
    {
      user_id: context.userId,
      endpoint: subscription.endpoint,
      subscription: subscription.raw,
      user_agent: request.headers.get("user-agent"),
      enabled: true,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const context = await requireAuthenticatedPushContext();

  if (context instanceof Response) {
    return context;
  }

  const body = await parseJson(request);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";

  if (!endpoint) {
    return Response.json({ error: "Chybí endpoint push subscription." }, { status: 400 });
  }

  const { error } = await context.supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", context.userId)
    .eq("endpoint", endpoint);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
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
    return Response.json({ error: "Pro push notifikace se musíte přihlásit." }, { status: 401 });
  }

  return { supabase, userId: user.id };
}

async function parsePushSubscription(request: Request) {
  const body = await parseJson(request);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  const keys = isRecord(body?.keys) ? body.keys : null;
  const p256dh = typeof keys?.p256dh === "string" ? keys.p256dh : "";
  const auth = typeof keys?.auth === "string" ? keys.auth : "";

  if (!endpoint || !p256dh || !auth) {
    return Response.json({ error: "Neplatná push subscription." }, { status: 400 });
  }

  return {
    endpoint,
    raw: body as Json,
  };
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
