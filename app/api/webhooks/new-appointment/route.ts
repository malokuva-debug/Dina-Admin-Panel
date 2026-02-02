import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:valmir.mlku@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export async function POST(request: Request) {
  try {
    const { appointment } = await request.json();
    
    console.log('📩 Webhook received for new appointment:', appointment);
    
    // 🔥 UPDATED: Fetch ALL push subscriptions for the worker
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription, endpoint')
      .eq('user_id', appointment.worker); // Removed .single()

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return NextResponse.json({ 
        success: false,
        message: 'Error fetching subscriptions' 
      }, { status: 500 });
    }

    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: '📅 New Appointment Booked',
        body: `${appointment.customer_name || 'Client'} booked ${appointment.service} on ${appointment.date} at ${appointment.time}`,
        icon: '/icon.png',
        badge: '/icon.png',
        data: { type: 'new_appointment', appointment },
      });

      // Send notification to ALL subscriptions
      const sendPromises = subscriptions.map(async (sub) => {
        try {
          console.log('Sending to endpoint:', sub.endpoint);
          await webpush.sendNotification(sub.subscription, payload);
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
      
      console.log(`✅ Instant notifications sent: ${successCount}/${subscriptions.length}`);
      
      return NextResponse.json({ 
        success: true,
        message: `Notifications sent to ${successCount}/${subscriptions.length} devices`,
        results
      });
    } else {
      console.log('⚠️ No subscriptions found for worker:', appointment.worker);
      
      return NextResponse.json({ 
        success: false,
        message: 'No subscriptions found' 
      });
    }
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}