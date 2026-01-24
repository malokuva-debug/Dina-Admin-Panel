/* eslint-disable @typescript-eslint/no-explicit-any */

// DO NOT add 'use client'

let MagicBellClient: any = null;

async function getClient() {
  if (!MagicBellClient) {
    const mod = await import('magicbell-js/project-client');
    MagicBellClient = mod.MagicBell;
  }
  return MagicBellClient;
}

const apiKey = process.env.MAGICBELL_API_KEY;
const apiSecret = process.env.MAGICBELL_API_SECRET;

export async function sendNotification(
  userId: string,
  title: string,
  content: string,
  actionUrl?: string
) {
  if (!apiKey || !apiSecret) {
    console.warn('MagicBell credentials missing');
    return null;
  }

  const MagicBell = await getClient();

  const magicbell = new MagicBell({
    apiKey,
    apiSecret,
  });

  return magicbell.notifications.create({
    title,
    content,
    recipients: [{ external_id: userId }],
    action_url: actionUrl,
  });
}