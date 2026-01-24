import { NextResponse } from 'next/server';
import { notifyWorkerNewAppointment } from '@/lib/notifications';

export async function POST(req: Request) {
  const { type, userId, data } = await req.json();
  let result = null;

  switch (type) {
    case 'new_appointment':
      result = await notifyWorkerNewAppointment(userId, data);
      break;

    case 'custom':
      // optionally, you can implement a custom notification function
      break;
  }

  return NextResponse.json({ success: true, result });
}