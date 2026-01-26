import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/webpush'; // your existing notification helper

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { date, service, clientName } = await request.json();

    if (!date || !service || !clientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1️⃣ Insert appointment (only columns that exist in DB)
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        date,
        service,
        client: clientName, // adjust if your table column is 'client' instead of 'client_name'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 2️⃣ Get all push subscriptions for this user (userId stored in push_subscriptions)
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription, user_id');

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    // 3️⃣ Send notification to each user
    for (const { subscription, user_id } of subscriptions) {
      // You can filter by user_id if needed
      await sendNotification(
        subscription,
        JSON.stringify({
          title: 'New Appointment!',
          body: `${clientName} booked ${service} on ${new Date(date).toLocaleString()}`,
        })
      );
    }

    return NextResponse.json({ success: true, appointment });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
