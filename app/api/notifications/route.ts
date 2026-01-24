import { NextResponse } from 'next/server';
import { notifyWorkerNewAppointment } from '@/lib/notifications';
import { sendNotification } from '@/lib/magicbell.server'; // import fixed

export async function POST(req: Request) {
  const { type, userId, data } = await req.json();

  let result = null;

  switch (type) {
    case 'new_appointment':
      result = await notifyWorkerNewAppointment(userId, data);
      break;

    case 'custom':
      result = await sendNotification(
        userId,
        data.title,
        data.content,
        data.actionUrl
      );
      break;
  }

  return NextResponse.json({ success: true, result });
}