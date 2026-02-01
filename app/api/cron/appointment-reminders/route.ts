import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

// Validate environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL;

if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
  console.error('Missing required VAPID environment variables');
} else {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// Authorization check for cron endpoint
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Use UTC for consistency
    const now = new Date();
    const nowUTC = new Date(now.toISOString());
    
    // Get current time + 1 hour window
    const oneHourLater = new Date(nowUTC.getTime() + 60 * 60 * 1000);
    
    console.log('Cron running at:', nowUTC.toISOString());

    // Fetch appointments in the next hour that haven't been reminded yet
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('datetime', nowUTC.toISOString())
      .lte('datetime', oneHourLater.toISOString())
      .is('reminder_sent_at', null); // Only get appointments without reminders

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${appointments?.length || 0} appointments in next hour`);

    const notifications = [];
    const errors = [];

    for (const appointment of appointments || []) {
      try {
        const appointmentDateTime = new Date(appointment.datetime);
        const timeDiff = appointmentDateTime.getTime() - nowUTC.getTime();
        const minutesUntil = Math.floor(timeDiff / 60000);

        console.log(`Appointment ${appointment.id}: ${minutesUntil} minutes away`);

        // Determine reminder type with buffer
        let reminderType = null;
        
        if (minutesUntil >= 55 && minutesUntil <= 65) {
          reminderType = '1 hour';
        } else if (minutesUntil >= 25 && minutesUntil <= 35) {
          reminderType = '30 minutes';
        }

        if (!reminderType) continue;

        console.log(`Sending ${reminderType} reminder for appointment ${appointment.id}`);

        // Fetch push subscription
        const { data: subData, error: subError } = await supabase
          .from('push_subscriptions')
          .select('subscription')
          .eq('user_id', appointment.worker)
          .single();

        if (subError || !subData?.subscription) {
          console.log(`⚠️ No subscription found for ${appointment.worker}`);
          errors.push({
            appointmentId: appointment.id,
            error: 'No push subscription',
            worker: appointment.worker
          });
          continue;
        }

        const payload = JSON.stringify({
          title: `⏰ Appointment in ${reminderType}`,
          body: `${appointment.customer_name || 'Client'} - ${appointment.service} at ${new Date(appointment.datetime).toLocaleTimeString()}`,
          icon: '/icon.png',
          badge: '/icon.png',
          data: { 
            type: 'reminder', 
            appointmentId: appointment.id,
            reminderType 
          },
        });

        await webpush.sendNotification(subData.subscription, payload);
        
        // Mark reminder as sent to prevent duplicates
        await supabase
          .from('appointments')
          .update({ 
            reminder_sent_at: nowUTC.toISOString(),
            reminder_type: reminderType 
          })
          .eq('id', appointment.id);

        console.log(`✅ Sent ${reminderType} reminder for appointment ${appointment.id}`);
        
        notifications.push({
          appointmentId: appointment.id,
          minutesUntil,
          reminderType,
          worker: appointment.worker,
          sentAt: nowUTC.toISOString()
        });

      } catch (appointmentError: any) {
        console.error(`❌ Error processing appointment ${appointment.id}:`, appointmentError);
        errors.push({
          appointmentId: appointment.id,
          error: appointmentError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: nowUTC.toISOString(),
      checked: appointments?.length || 0,
      sent: notifications.length,
      failed: errors.length,
      notifications,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Cron error:', error);
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}