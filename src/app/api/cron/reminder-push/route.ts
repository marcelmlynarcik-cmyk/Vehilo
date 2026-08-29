import { deliverReminderPushNotifications } from "@/lib/push/reminder-delivery";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await deliverReminderPushNotifications();
  const status = result.ok ? 200 : 500;

  return Response.json(result, { status });
}
