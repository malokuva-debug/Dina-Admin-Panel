// lib/magicbell.server.ts
import { MagicBellClient } from 'magicbell-js'; // ✅ use named import from 'magicbell-js'

let client: MagicBellClient | null = null;

export function getMagicBellClient() {
  if (!client) {
    client = new MagicBellClient({
      apiKey: process.env.MAGICBELL_API_KEY!,
      projectId: process.env.MAGICBELL_PROJECT_ID!, // required
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