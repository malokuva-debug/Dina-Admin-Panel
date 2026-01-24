// app/api/notifications/route.ts
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:you@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { subscription, title, message } = await req.json();

  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, message }));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err }), { status: 500 });
  }
}