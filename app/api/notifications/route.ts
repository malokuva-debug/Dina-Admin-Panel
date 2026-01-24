// app/api/notifications/route.ts
// Server-side API route for sending MagicBell notifications

import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, notifyWorkerNewAppointment }from '@/lib/magicbell.server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, data } = body;

    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, userId' },
        { status: 400 }
      );
    }

    let result;

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
      
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
