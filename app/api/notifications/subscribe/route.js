// app/api/notifications/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json();

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: 'Missing subscription or userId' },
        { status: 400 }
      );
    }

    // Store subscription in database or memory
    // For now, we'll use Supabase to store subscriptions
    
    // Create subscriptions table if using Supabase:
    // You'll need to add this table to your schema
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: subscription,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving subscription:', error);
      
      // Fallback: store in memory if Supabase table doesn't exist
      // In production, you should create the table
      if (typeof global.pushSubscriptions === 'undefined') {
        global.pushSubscriptions = new Map();
      }
      global.pushSubscriptions.set(userId, subscription);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}