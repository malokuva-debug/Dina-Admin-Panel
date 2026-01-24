import { MagicBell } from 'magicbell-js/project-client'; // ✅ use named import

let client: MagicBell | null = null;

export function getMagicBellClient() {
  if (!client) {
    client = new MagicBell({
      apiKey: process.env.MAGICBELL_API_KEY!,
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