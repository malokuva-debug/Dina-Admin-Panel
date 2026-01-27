import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notifications';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// 👑 HARD-CODE OWNER USER ID (CHANGE THIS)
const OWNER_USER_ID = 'dina';

export async function POST(request: Request) {
  try {
    const { date, service, clientName } = await request.json();

    if (!date || !service || !clientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1️⃣ Insert appointment (ONLY existing DB columns)
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        date,
        service,
        customer_name: clientName, // 🔁 must match DB column
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // 2️⃣ Fetch OWNER push subscriptions ONLY
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', OWNER_USER_ID);

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return NextResponse.json(
        { error: subError.message },
        { status: 500 }
      );
    }

    // 3️⃣ Send push notifications to OWNER
    if (subscriptions?.length) {
      for (const { subscription } of subscriptions) {
        await sendNotification(
          subscription,
          JSON.stringify({
            title: '📅 New Appointment',
            body: `${clientName} booked ${service} on ${new Date(date).toLocaleString()}`,
          }),
          "" // ✅ REQUIRED third argument
        );
      }
    }

    return NextResponse.json({
      success: true,
      appointment,
      notified: subscriptions?.length ?? 0,
    });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
