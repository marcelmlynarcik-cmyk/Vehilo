import "server-only";

import type { User } from "@supabase/supabase-js";

const webhookUrl = process.env.NEW_USER_NOTIFICATION_WEBHOOK_URL;
const webhookSecret = process.env.NEW_USER_NOTIFICATION_WEBHOOK_SECRET;

export async function notifyNewUser(user: User) {
  if (!webhookUrl || !isLikelyFirstSignIn(user)) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret ? { "X-Vehilo-Webhook-Secret": webhookSecret } : {}),
      },
      body: JSON.stringify({
        type: "new_user",
        secret: webhookSecret ?? null,
        idempotencyKey: user.id,
        occurredAt: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email ?? null,
          name: getUserName(user),
          provider: user.app_metadata.provider ?? null,
          createdAt: user.created_at,
        },
      }),
    });
  } catch (error) {
    console.error("New user notification failed", error);
  }
}

function isLikelyFirstSignIn(user: User) {
  const createdAt = Date.parse(user.created_at);
  const lastSignInAt = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : createdAt;

  if (!Number.isFinite(createdAt) || !Number.isFinite(lastSignInAt)) {
    return false;
  }

  return Math.abs(lastSignInAt - createdAt) <= 5 * 60 * 1000;
}

function getUserName(user: User) {
  const metadata = user.user_metadata;

  if (typeof metadata.full_name === "string") {
    return metadata.full_name;
  }

  if (typeof metadata.name === "string") {
    return metadata.name;
  }

  return null;
}
