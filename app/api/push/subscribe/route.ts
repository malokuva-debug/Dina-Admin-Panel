// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Subscribe API called');
    
    const body = await request.json();
    console.log('Body received:', JSON.stringify(body, null, 2));
    
    const { subscription, userId } = body;

    // 1️⃣ Validate input
    if (!subscription || !userId) {
      console.error('❌ Missing subscription or userId');
      return NextResponse.json(
        { error: 'Missing subscription or userId' },
        { status: 400 }
      );
    }

    // 2️⃣ Validate subscription object structure
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      console.error('❌ Invalid subscription object:', subscription);
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');
    console.log('Endpoint:', subscription.endpoint);
    console.log('User ID:', userId);

    // 3️⃣ Upsert into Supabase
    const dataToInsert = {
      user_id: userId,
      endpoint: subscription.endpoint,
      subscription,
      updated_at: new Date().toISOString(),
    };
    
    console.log('📤 Upserting to Supabase:', dataToInsert);

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(dataToInsert, { onConflict: 'user_id,endpoint' })
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save subscription', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Subscription saved successfully:', data);

    // 4️⃣ Success
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('❌ Subscribe error:', err);
    return NextResponse.json(
      { error: 'Failed to save subscription', details: err.message },
      { status: 500 }
    );
  }
}
