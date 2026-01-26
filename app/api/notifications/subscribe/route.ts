import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { g } from '@/lib/pushSubscriptions';

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json();

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Missing subscription or userId' }, { status: 400 });
    }

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: userId,
          subscription,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error saving subscription:', error);

      // fallback to in-memory storage
      g.pushSubscriptions.set(userId, subscription);

      return NextResponse.json({ success: false, fallback: true });
    }

    // Save in-memory too
    g.pushSubscriptions.set(userId, subscription);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
