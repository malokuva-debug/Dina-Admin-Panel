// /lib/notifications.ts
import { sendNotification } from './magicbell.server';

export async function notifyWorkerNewAppointment(
  userId: string,
  data: any
) {
  return sendNotification(
    userId,
    'New appointment',
    `Client: ${data.clientName}`,
    data.url
  );
}