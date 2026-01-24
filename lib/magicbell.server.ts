// /lib/magicbell.server.ts
import { MagicBellClient } from 'magicbell-js';

let client: MagicBellClient | null = null;

export function getMagicBellClient() {
  if (!client) {
    client = new MagicBellClient({
      apiKey: process.env.MAGICBELL_API_KEY, // server-side key
    });
  }
  return client;
}

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