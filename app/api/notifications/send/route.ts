// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

// VAPID configuration
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:valmir.mlku@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// Ensure global pushSubscriptions map exists (once)
const g = global as typeof globalThis & {
  pushSubscriptions: Map<string, any>;
};

if (!g.pushSubscriptions) {
  g.pushSubscriptions = new Map<string, any>();
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, data } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
    }

    // Try to fetch subscription from Supabase
    let subscription: any = null;
    try {
      const { data: subData, error } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId)
        .single();

      if (!error && subData) {
        subscription = subData.subscription;
      }
    } catch {
      console.log('Database not available, using in-memory storage');
      // fallback: check in-memory map
      if (g.pushSubscriptions.has(userId)) {
        subscription = g.pushSubscriptions.get(userId);
      }
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found for user' },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon.png',
      badge: '/icon.png',
      data: data || {},
    });

    await webpush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send notification error:', error);

    // Remove expired subscriptions (HTTP 410)
    try {
      const { userId } = await request.json();
      if (error.message?.includes('410')) {
        await supabase.from('push_subscriptions').delete().eq('user_id', userId);
        g.pushSubscriptions.delete(userId);
      }
    } catch (e) {
      console.error('Failed to remove expired subscription:', e);
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
