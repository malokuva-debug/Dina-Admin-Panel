// lib/magicbell.server.ts
import { MagicBellClient } from "magicbell-js";

// initialize client once
const client = new MagicBellClient({
  apiKey: process.env.MAGICBELL_API_KEY || "",
  projectId: process.env.MAGICBELL_PROJECT_ID || "",
});

export async function sendNotification(
  title: string,
  content: string,
  actionUrl?: string
) {
  return client.notifications.create({
    title,
    content,
    actionUrl,
  });
}