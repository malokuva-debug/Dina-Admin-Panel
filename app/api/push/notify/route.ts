// app/api/push/notify/route.ts
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
  console.log('=== NOTIFICATION ENDPOINT CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Notification request:', body);
    
    const { worker, customer_name, service, date, time, id } = body;
    
    if (!worker) {
      return NextResponse.json({ error: 'Missing worker' }, { status: 400 });
    }

    // Get all subscriptions for this worker
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription, endpoint')
      .eq('user_id', worker);

    console.log(`Found ${subscriptions?.length || 0} subscriptions for ${worker}`);

    if (!subError && subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: '📅 New Appointment',
        body: `${customer_name} booked ${service} on ${date} at ${time}`,
        icon: '/icon.png',
        badge: '/icon.png',
        data: { 
          type: 'new_appointment', 
          appointment: { id, worker, customer_name, service, date, time }
        },
      });

      const sendPromises = subscriptions.map(async (sub) => {
        try {
          let subscriptionObj = sub.subscription;
          if (typeof subscriptionObj === 'string') {
            subscriptionObj = JSON.parse(subscriptionObj);
          }
          
          await webpush.sendNotification(subscriptionObj, payload);
          console.log('✅ Notification sent to:', sub.endpoint);
          return { success: true };
        } catch (err: any) {
          console.error('❌ Failed to send:', err.message);
          
          // Remove invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
          
          return { success: false };
        }
      });

      const results = await Promise.all(sendPromises);
      const successCount = results.filter(r => r.success).length;
      
      console.log(`✅ Sent ${successCount}/${subscriptions.length} notifications`);
      
      return NextResponse.json({
        success: true,
        sent: successCount,
        total: subscriptions.length
      });
    }
    
    console.log('⚠️ No subscriptions found');
    return NextResponse.json({ success: true, sent: 0 });
    
  } catch (err: any) {
    console.error('❌ Notification error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
