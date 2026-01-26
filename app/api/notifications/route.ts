// app/api/notifications/route.ts
// Legacy route - redirects to new endpoints

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Use /api/notifications/send instead.',
      info: 'The notification system has been migrated to Web Push notifications.'
    },
    { status: 410 }
  );
}
