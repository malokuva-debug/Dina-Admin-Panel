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

const OWNER_USER_ID = 'dina';

export async function POST(request: Request) {
  console.log('=== API ROUTE STARTED ===');
  
  try {
    // Check env vars first
    console.log('Env check:', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY
    });

    const body = await request.json();
    console.log('Received body:', body);
    
    const { date, service, clientName, worker } = body;

    // ✅ Validate required fields
    if (!date || !service || !clientName || !worker) {
      console.log('Validation failed:', { date, service, clientName, worker });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('About to insert into Supabase...');
    
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

    console.log('Insert result:', { appointment, insertError });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('Fetching subscriptions...');
    
    // 2️⃣ Fetch OWNER push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', OWNER_USER_ID);

    console.log('Subscriptions result:', { subscriptions, subError });

    if (subError) {
      console.error('Subscription fetch error:', subError);
      // Don't fail the whole request for this
    }

    // 3️⃣ Send push notifications
    if (subscriptions?.length) {
      console.log(`Sending ${subscriptions.length} notifications...`);
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
        console.log('Notifications sent successfully');
      } catch (notifError) {
        console.error('Notification error (non-fatal):', notifError);
      }
    }

    console.log('=== API ROUTE SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      appointment,
      notified: subscriptions?.length ?? 0,
    });
  } catch (err: any) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error:', err);
    
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}