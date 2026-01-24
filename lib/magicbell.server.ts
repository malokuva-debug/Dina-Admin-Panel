// /lib/magicbell.server.ts

import MagicBellClient from 'magicbell-js/dist/esm/project-client'; // exact path

let client: any;

export function getMagicBellClient() {
  if (!client) {
    client = new MagicBellClient({
      apiKey: process.env.NEXT_PUBLIC_MAGICBELL_API_KEY,
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