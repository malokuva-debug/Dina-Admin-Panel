import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL;
const CRON_SECRET = process.env.CRON_SECRET;

if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
  console.error('❌ Missing VAPID environment variables');
} else {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

const BUSINESS_TIMEZONE = 'America/New_York';

/**
 * Get current date in NY timezone (as Date object in UTC representing NY time)
 */
function getNowNY() {
  return new Date(new Date().toLocaleString('en-US', { 
    timeZone: BUSINESS_TIMEZONE 
  }));
}

/**
 * Convert appointment datetime (stored as UTC) to NY timezone equivalent
 */
function getAppointmentDateTime(datetime: string) {
  const utcDate = new Date(datetime);
  // Convert UTC to NY local time string, then parse as Date
  const nyTimeString = utcDate.toLocaleString('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return new Date(nyTimeString);
}

export async function GET(request: Request) {
  // 🔐 AUTH
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = getNowNY();

    // 🔍 Look ahead window (2 hours)
    const lookAhead = new Date(now);
    lookAhead.setHours(now.getHours() + 2);

    console.log('⏰ CRON RUN (NY):', now.toISOString());
    console.log('🔍 Checking until:', lookAhead.toISOString());

    // 📦 Fetch upcoming appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'pending')
      .gte('datetime', now.toISOString())
      .lte('datetime', lookAhead.toISOString());

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`📅 Found ${appointments?.length || 0} upcoming appointments`);

    const notifications: any[] = [];
    const errors: any[] = [];
    const debugLogs: any[] = [];

    for (const appointment of appointments || []) {
      try {
        const appointmentTime = getAppointmentDateTime(appointment.datetime);
        const diffMs = appointmentTime.getTime() - now.getTime();
        const minutesUntil = Math.floor(diffMs / 60000);

        const in1HourWindow = minutesUntil >= 55 && minutesUntil <= 65;
        const in30MinWindow = minutesUntil >= 25 && minutesUntil <= 35;

        debugLogs.push({
          id: appointment.id,
          minutesUntil,
          in1HourWindow,
          in30MinWindow,
          reminder1hrSent: !!appointment.reminder_1hour_sent_at,
          reminder30minSent: !!appointment.reminder_30min_sent_at,
        });

        if (minutesUntil < 0) continue;

        let reminderType: '1 hour' | '30 minutes' | null = null;

        if (in1HourWindow && !appointment.reminder_1hour_sent_at) {
          reminderType = '1 hour';
        }

        if (in30MinWindow && !appointment.reminder_30min_sent_at) {
          reminderType = '30 minutes';
        }

        if (!reminderType) continue;

        console.log(`📣 Sending ${reminderType} reminder → ${appointment.id}`);

        // 🔔 Fetch push subscription
        const { data: subData, error: subError } = await supabase
          .from('push_subscriptions')
          .select('subscription')
          .eq('user_id', appointment.worker)
          .single();

        if (subError || !subData?.subscription) {
          errors.push({
            appointmentId: appointment.id,
            error: 'No push subscription',
          });
          continue;
        }

        const payload = JSON.stringify({
          title: `⏰ Appointment in ${reminderType}`,
          body: `${appointment.customer_name || 'Client'} — ${appointment.service} at ${appointment.time}`,
          icon: '/icon.png',
          badge: '/icon.png',
          data: {
            appointmentId: appointment.id,
            reminderType,
          },
        });

        await webpush.sendNotification(subData.subscription, payload);

        // 📝 Mark reminder as sent
        if (reminderType === '1 hour') {
          await supabase
            .from('appointments')
            .update({ reminder_1hour_sent_at: now.toISOString() })
            .eq('id', appointment.id);
        }

        if (reminderType === '30 minutes') {
          await supabase
            .from('appointments')
            .update({ reminder_30min_sent_at: now.toISOString() })
            .eq('id', appointment.id);
        }

        notifications.push({
          appointmentId: appointment.id,
          reminderType,
          minutesUntil,
        });

        console.log(`✅ Reminder sent (${reminderType}) → ${appointment.id}`);
      } catch (err: any) {
        console.error('❌ Appointment error:', err);
        errors.push({
          appointmentId: appointment.id,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timezone: BUSINESS_TIMEZONE,
      now: now.toISOString(),
      checked: appointments?.length || 0,
      sent: notifications.length,
      failed: errors.length,
      debugLogs,
      notifications,
      errors: errors.length ? errors : undefined,
    });
  } catch (err: any) {
    console.error('🔥 CRON FATAL ERROR:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}