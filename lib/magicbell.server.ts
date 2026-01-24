// Import the official client directly from the package
import { MagicBellClient } from 'magicbell-js';

let client: MagicBellClient | null = null;

// Initialize MagicBellClient only once
export function getMagicBellClient() {
  if (!client) {
    client = new MagicBellClient({
      apiKey: process.env.MAGICBELL_API_KEY!, // your server key
    });
  }
  return client;
}

// Generic function to send a notification
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