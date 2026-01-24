// lib/magicbell.server.ts
import { MagicBellClient } from 'magicbell-js'; // ✅ correct named import

let client: MagicBellClient | null = null;

export async function sendNotification(
  userId: string,
  title: string,
  content: string,
  actionUrl?: string
) {
  const magicbell = getMagicBellClient();
  return magicbell.notifications.create({
    title,
    content,
    recipients: [userId],
    actionUrl,
  });
}