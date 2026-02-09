// app/api/appointments/route.ts
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
    
    const { date, service, clientName, worker, price = 0, customerPhone } = body;
    
    if (!date || !service || !clientName || !worker) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract date and time from the ISO string
    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0];
    const timeString = dateObj.toTimeString().slice(0, 8); // HH:MM:SS format
    
    // Calculate duration based on service
    const serviceDurations: Record<string, number> = {
      'Russian Hard Gel Manicure': 75,
      'Russian Gel Manicure': 60,
      'Pedicure': 45,
      'Manicure': 45,
      'Gel Polish': 30,
    };
    
    const duration = serviceDurations[service] || 60;
    
    // Calculate estimated completion time
    const estimatedCompletion = new Date(dateObj);
    estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + duration);
    const estimatedCompletionTime = estimatedCompletion.toTimeString().slice(0, 8);
    
    console.log('Inserting appointment with datetime:', dateObj.toISOString());
    
    // Insert appointment with all required fields
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        worker,
        date: dateString,
        time: timeString,
        service,
        price: price,
        customer_name: clientName,
        customer_phone: customerPhone || null,
        status: 'pending',
        is_done: false,
        duration: duration,
        datetime: dateObj.toISOString(),
        estimated_completion_time: estimatedCompletionTime,
        reminder_sent: false,
        reminder_1hour_sent_at: null,
        reminder_30min_sent_at: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('✅ Appointment created:', appointment.id);

    // Send push notification to ALL devices for this worker
    try {
      console.log(`📱 Fetching push subscriptions for ${worker}...`);
      
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('subscription, endpoint, id')
        .eq('user_id', worker);

      if (subError) {
        console.error('❌ Subscription fetch error:', subError);
      }

      console.log(`Found ${subscriptions?.length || 0} subscriptions`);

      if (subscriptions && subscriptions.length > 0) {
        const payload = JSON.stringify({
          title: '📅 New Appointment',
          body: `${clientName} booked ${service} on ${dateObj.toLocaleDateString()} at ${timeString.slice(0, 5)}`,
          icon: '/icon.png',
          badge: '/icon.png',
          tag: `appointment-${appointment.id}`,
          data: { 
            type: 'new_appointment', 
            appointmentId: appointment.id,
            url: '/' // URL to open when clicked
          },
        });

        let successCount = 0;
        let failCount = 0;

        for (const sub of subscriptions) {
          try {
            console.log(`Sending to: ${sub.endpoint.substring(0, 50)}...`);
            await webpush.sendNotification(sub.subscription, payload);
            console.log('✅ Sent successfully');
            successCount++;
          } catch (err: any) {
            console.error('❌ Send failed:', err.message);
            failCount++;
            
            // Remove invalid subscriptions
            if (err.statusCode === 410 || err.statusCode === 404) {
              console.log('🗑️ Removing invalid subscription');
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id);
            }
          }
        }

        console.log(`📊 Results: ${successCount} sent, ${failCount} failed`);
      } else {
        console.log('⚠️ No subscriptions found for worker:', worker);
      }
    } catch (notifError: any) {
      console.error('❌ Notification error:', notifError.message);
      // Don't fail the request
    }

    console.log('=== SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    console.error('=== FATAL ERROR ===');
    console.error('Message:', err?.message);
    console.error('Stack:', err?.stack);
    
    return NextResponse.json(
      { error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}