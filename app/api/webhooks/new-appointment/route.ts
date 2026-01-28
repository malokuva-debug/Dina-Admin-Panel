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

    // Fetch push subscription for the worker
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', appointment.worker)
      .single();

    if (subData?.subscription) {
      const payload = JSON.stringify({
        title: '📅 New Appointment Booked',
        body: `${appointment.customer_name || 'Client'} booked ${appointment.service} on ${appointment.date} at ${appointment.time}`,
        icon: '/icon.png',
        badge: '/icon.png',
        data: { type: 'new_appointment', appointment },
      });

      await webpush.sendNotification(subData.subscription, payload);
      console.log('✅ Instant notification sent via webhook');
      
      return NextResponse.json({ 
        success: true,
        message: 'Notification sent' 
      });
    } else {
      console.log('⚠️ No subscription found for worker:', appointment.worker);
      
      return NextResponse.json({ 
        success: false,
        message: 'No subscription found' 
      });
    }
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}