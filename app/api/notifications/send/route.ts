import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

// VAPID configuration
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:valmir.mlku@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export async function POST(request: Request) {
  console.log('=== API ROUTE STARTED ===');
  
  try {
    const body = await request.json();
    console.log('Body parsed:', body);
    
    const { date, service, clientName, worker, price = 0 } = body;

    if (!date || !service || !clientName || !worker) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract date and time from the ISO string
    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0];
    const timeString = dateObj.toTimeString().slice(0, 5);

    console.log('Inserting appointment...');
    
    // Insert appointment
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        worker,
        date: dateString,
        time: timeString,
        service,
        price: price,
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

    console.log('Appointment created:', appointment);

    // Send push notification to 'dina'
    try {
      console.log('Fetching push subscription for dina...');
      
      const { data: subData, error: subError } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', 'dina')
        .single();

      console.log('Subscription fetch result:', { subData, subError });

      if (!subError && subData?.subscription) {
        const payload = JSON.stringify({
          title: '📅 New Appointment',
          body: `${clientName} booked ${service} on ${dateObj.toLocaleDateString()} at ${timeString}`,
          icon: '/icon.png',
          badge: '/icon.png',
          data: { type: 'new_appointment', appointment },
        });

        console.log('Sending push notification...');
        await webpush.sendNotification(subData.subscription, payload);
        console.log('✅ Notification sent successfully');
      } else {
        console.log('⚠️ No push subscription found for dina');
      }
    } catch (notifError: any) {
      console.error('❌ Notification error:', notifError);
      // Don't fail the whole request
    }

    console.log('=== SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    console.error('=== CAUGHT ERROR ===');
    console.error('Message:', err?.message);
    console.error('Stack:', err?.stack);
    
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}