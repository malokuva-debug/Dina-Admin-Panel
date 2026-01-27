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

export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    const { userId: uid, title, body, data } = await request.json();
    userId = uid;

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

    // Fetch subscription from Supabase
    let subscription: any = null;

    const { data: subData, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .single();

    if (!error && subData?.subscription) {
      subscription = subData.subscription;
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

    // Cleanup expired subscriptions
    if (userId && (error?.statusCode === 410 || error?.message?.includes('410'))) {
      try {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId);
      } catch (e) {
        console.error('Failed to delete expired subscription:', e);
      }

      g.pushSubscriptions?.delete(userId);
    }

    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}