// /lib/magicbell.server.ts
let MagicBellClient: any;

export async function getMagicBellClient() {
  if (!MagicBellClient) {
    const mod = await import('magicbell-js'); // dynamically import the package
    MagicBellClient = mod.default;           // get the default export
  }
  return MagicBellClient;
}

export async function sendNotification(
  userId: string,
  title: string,
  content: string,
  actionUrl?: string
) {
  const MagicBell = await getMagicBellClient();

  const client = new MagicBell({
    apiKey: process.env.NEXT_PUBLIC_MAGICBELL_API_KEY // make sure you have this in your Vercel env
  });

  return client.notifications.create({
    title,
    content,
    recipients: [userId],
    actionUrl
  });
}