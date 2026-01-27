import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notifications';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const g = globalThis as unknown as {
  pushSubscriptions?: Map<string, any>;
};

g.pushSubscriptions ??= new Map();

// 👑 HARD-CODE OWNER USER ID
const OWNER_USER_ID = 'dina';

export async function POST(request: Request) {
  try {
    const { date, service, clientName, worker } = await request.json();

    console.log('API /appointments body:', {
      date,
      service,
      clientName,
      worker,
    });

    // ✅ Validate required fields
    if (!date || !service || !clientName || !worker) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1️⃣ Insert appointment
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        worker,
        date,
        service,
        customer_name: clientName,
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

    // 2️⃣ Fetch OWNER push subscriptions
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

// 3️⃣ Send push notifications
if (subscriptions?.length) {
  try {
    for (const { subscription } of subscriptions) {
      await sendNotification(
        subscription,
        JSON.stringify({
          title: '📅 New Appointment',
          body: `${clientName} booked ${service} on ${new Date(date).toLocaleString()}`,
        }),
        ''
      );
    }
  } catch (notifError) {
    console.error('Notification error (non-fatal):', notifError);
    // Don't fail the whole request if notifications fail
  }
}

    return NextResponse.json({
      success: true,
      appointment,
      notified: subscriptions?.length ?? 0,
    });
  } catch (err: any) {
    console.error('Unexpected API error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}