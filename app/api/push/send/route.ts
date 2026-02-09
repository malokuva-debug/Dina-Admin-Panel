// app/api/push/send/route.ts (or wherever your send logic is)
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

    // 🔥 UPDATED: Send push notification to ALL devices for this worker
    try {
      console.log(`Fetching ALL push subscriptions for ${worker}...`);
      
      // Get all subscriptions for this worker, ordered by most recent first
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('subscription, endpoint, created_at')
        .eq('user_id', worker)
        .order('created_at', { ascending: false });

      console.log('Subscriptions found:', subscriptions?.length || 0);

      if (!subError && subscriptions && subscriptions.length > 0) {
        const payload = JSON.stringify({
          title: '📅 New Appointment',
          body: `${clientName} booked ${service} on ${dateObj.toLocaleDateString()} at ${timeString}`,
          icon: '/icon.png',
          badge: '/icon.png',
          data: { type: 'new_appointment', appointment },
        });

        // Send notification to ALL subscriptions
        const sendPromises = subscriptions.map(async (sub) => {
          try {
            console.log('Sending to endpoint:', sub.endpoint);
            
            // 🔥 CRITICAL FIX: Parse the subscription if it's a string
            let subscriptionObj = sub.subscription;
            if (typeof subscriptionObj === 'string') {
              subscriptionObj = JSON.parse(subscriptionObj);
            }
            
            await webpush.sendNotification(subscriptionObj, payload);
            console.log('✅ Notification sent to:', sub.endpoint);
            return { success: true, endpoint: sub.endpoint };
          } catch (err: any) {
            console.error('❌ Failed to send to:', sub.endpoint, err);
            
            // If subscription is expired/invalid, delete it
            if (err.statusCode === 410 || err.statusCode === 404) {
              console.log('Removing invalid subscription:', sub.endpoint);
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint);
            }
            
            return { success: false, endpoint: sub.endpoint, error: err.message };
          }
        });

        const results = await Promise.all(sendPromises);
        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Notifications sent: ${successCount}/${subscriptions.length}`);
        
        return NextResponse.json({
          success: true,
          appointment,
          notifications: {
            sent: successCount,
            total: subscriptions.length,
            results: results
          }
        });
      } else {
        console.log(`⚠️ No push subscriptions found for ${worker}`);
        
        return NextResponse.json({
          success: true,
          appointment,
          notifications: {
            sent: 0,
            total: 0,
            warning: 'No push subscriptions found'
          }
        });
      }
    } catch (notifError: any) {
      console.error('❌ Notification error:', notifError);
      
      // Don't fail the whole request, but return the error info
      return NextResponse.json({
        success: true,
        appointment,
        notifications: {
          error: notifError.message,
          sent: 0,
          total: 0
        }
      });
    }
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
