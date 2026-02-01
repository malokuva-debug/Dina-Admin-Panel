import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL;

if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
  console.error('Missing required VAPID environment variables');
} else {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// Business timezone
const BUSINESS_TIMEZONE = 'America/New_York';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get current time in business timezone
    const nowInTimezone = new Date().toLocaleString("en-US", { timeZone: BUSINESS_TIMEZONE });
    const now = new Date(nowInTimezone);
    
    // Get today's date in YYYY-MM-DD format
    const todayDate = now.toISOString().split('T')[0];
    
    console.log('Cron running at (NY time):', now.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE }));
    console.log('Looking for appointments on:', todayDate);

    // Fetch TODAY's appointments only (using date field, not datetime)
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', todayDate);

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${appointments?.length || 0} appointments today`);

    const notifications = [];
    const errors = [];

    for (const appointment of appointments || []) {
  try {
    // Combine date and time to create full datetime in NY timezone
    const appointmentDateTimeStr = `${appointment.date}T${appointment.time}:00`;
    const appointmentDateTime = new Date(appointmentDateTimeStr + ' GMT-0500'); // NY timezone
    
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(timeDiff / 60000);

    console.log(`========================================`);
    console.log(`Appointment ${appointment.id}:`);
    console.log(`  Time: ${appointment.time}`);
    console.log(`  Minutes until: ${minutesUntil}`);
    console.log(`  1hr reminder sent: ${appointment.reminder_1hour_sent_at || 'NO'}`);
    console.log(`  30min reminder sent: ${appointment.reminder_30min_sent_at || 'NO'}`);
    console.log(`========================================`);

    // Skip past appointments
    if (minutesUntil < 0) {
      console.log(`⏭️ Skipping - appointment is in the past`);
      continue;
    }

    // Determine reminder type with buffer
    let reminderType = null;
    
    if (minutesUntil >= 55 && minutesUntil <= 65) {
      reminderType = '1 hour';
      
      if (appointment.reminder_1hour_sent_at) {
        console.log(`1 hour reminder already sent for ${appointment.id}`);
        continue;
      }
    } 
    else if (minutesUntil >= 25 && minutesUntil <= 35) {
      reminderType = '30 minutes';
      
      if (appointment.reminder_30min_sent_at) {
        console.log(`30 min reminder already sent for ${appointment.id}`);
        continue;
      }
    } else {
      console.log(`⏭️ Skipping - not in reminder window (need 25-35 or 55-65 minutes)`);
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
          body: `${appointment.customer_name || 'Client'} - ${appointment.service} at ${appointment.time}`,
          icon: '/icon.png',
          badge: '/icon.png',
          data: { 
            type: 'reminder', 
            appointmentId: appointment.id,
            reminderType 
          },
        });

        await webpush.sendNotification(subData.subscription, payload);
        
        // Mark the SPECIFIC reminder as sent
        if (reminderType === '1 hour') {
          await supabase
            .from('appointments')
            .update({ reminder_1hour_sent_at: now.toISOString() })
            .eq('id', appointment.id);
        } 
        else if (reminderType === '30 minutes') {
          await supabase
            .from('appointments')
            .update({ reminder_30min_sent_at: now.toISOString() })
            .eq('id', appointment.id);
        }

        console.log(`✅ Sent ${reminderType} reminder for appointment ${appointment.id}`);
        
        notifications.push({
          appointmentId: appointment.id,
          appointmentTime: appointment.time,
          minutesUntil,
          reminderType,
          worker: appointment.worker,
          sentAt: now.toISOString()
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
      timestamp: now.toLocaleString('en-US', { timeZone: BUSINESS_TIMEZONE }),
      timezone: BUSINESS_TIMEZONE,
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