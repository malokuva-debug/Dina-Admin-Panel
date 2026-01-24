import { MagicBell } from 'magicbell-js/dist/esm/project-client';

const apiKey = process.env.MAGICBELL_API_KEY!;
const apiSecret = process.env.MAGICBELL_API_SECRET!;

if (!apiKey || !apiSecret) {
  console.warn('MagicBell credentials missing');
}

export const magicbell =
  apiKey && apiSecret
    ? new MagicBell({
        apiKey,
        apiSecret,
      })
    : null;

export async function sendNotification(
  userId: string,
  title: string,
  content: string,
  actionUrl?: string
) {
  if (!magicbell) return null;

  return magicbell.notifications.create({
    title,
    content,
    recipients: [{ external_id: userId }],
    action_url: actionUrl,
  });
}