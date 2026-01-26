import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const { userId, date, service, clientName } = await req.json();

    if (!userId || !date || !service || !clientName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Insert appointment into Supabase
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({ user_id: userId, date, service, client_name: clientName })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Fetch push subscriptions for this user
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId);

    // Send push notifications
    if (subscriptions?.length) {
  for (const { subscription } of subscriptions) {
    await sendNotification(
      subscription,
      JSON.stringify({
        title: 'New Appointment!',
        body: `${clientName} booked ${service} on ${new Date(date).toLocaleString()}`,
      }),
      {} // optional
    );
  }
}

    return NextResponse.json({ appointment });
  } catch (err) {
    console.error('Error creating appointment:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
