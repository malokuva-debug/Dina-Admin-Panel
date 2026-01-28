import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:valmir.mlku@gmail.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export async function GET() {
  try {
    const now = new Date();
    
    // Get today's date in YYYY-MM-DD format
    const today = now.toISOString().split('T')[0];
    
    // Current time in HH:MM format
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Time 1 hour from now
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourTime = oneHourLater.toTimeString().slice(0, 5);

    console.log('Cron running at:', now.toISOString());
    console.log('Checking appointments between', currentTime, 'and', oneHourTime);

    // Fetch appointments happening in the next hour
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', today)
      .gte('time', currentTime)
      .lte('time', oneHourTime);

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${appointments?.length || 0} appointments in next hour`);

    const notifications = [];

    for (const appointment of appointments || []) {
      // Combine date and time to get full datetime
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const minutesUntil = Math.floor(timeDiff / 60000);

      console.log(`Appointment ${appointment.id}: ${minutesUntil} minutes away`);

      // Send reminder if approximately 30 mins or 1 hour before
      // Using a 5-minute buffer to catch the appointment during cron runs
      let reminderType = null;
      
      if (minutesUntil >= 55 && minutesUntil <= 65) {
        reminderType = '1 hour';
      } else if (minutesUntil >= 25 && minutesUntil <= 35) {
        reminderType = '30 minutes';
      }

      if (reminderType) {
        console.log(`Sending ${reminderType} reminder for appointment ${appointment.id}`);
        
        // Fetch push subscription for the worker
        const { data: subData } = await supabase
          .from('push_subscriptions')
          .select('subscription')
          .eq('user_id', appointment.worker)
          .single();

        if (subData?.subscription) {
          const payload = JSON.stringify({
            title: `⏰ Appointment in ${reminderType}`,
            body: `${appointment.customer_name || 'Client'} - ${appointment.service} at ${appointment.time}`,
            icon: '/icon.png',
            badge: '/icon.png',
            data: { type: 'reminder', appointment, reminderType },
          });

          try {
            await webpush.sendNotification(subData.subscription, payload);
            console.log(`✅ Sent ${reminderType} reminder for appointment ${appointment.id}`);
            notifications.push({ 
              appointmentId: appointment.id, 
              minutesUntil,
              reminderType,
              worker: appointment.worker 
            });
          } catch (pushError) {
            console.error(`❌ Failed to send notification:`, pushError);
          }
        } else {
          console.log(`⚠️ No subscription found for ${appointment.worker}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      timestamp: now.toISOString(),
      checked: appointments?.length || 0,
      sent: notifications.length,
      notifications 
    });
  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}