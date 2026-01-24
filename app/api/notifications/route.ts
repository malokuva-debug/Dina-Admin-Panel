import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/magicbell.server';

export async function POST(req: Request) {
  const { type, userId, data } = await req.json();

  let result = null;

  switch (type) {
    case 'new_appointment':
      result = await sendNotification(
        userId,
        'New appointment',
        `You have a new appointment scheduled.`,
        data?.url
      );
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