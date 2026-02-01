import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL;

if (vapidPublicKey && vapidPrivateKey && vapidEmail) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const reminderType = searchParams.get('type'); // '1hour' or '30min'

    if (!appointmentId || !reminderType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Fetch the appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if reminder already sent
    if (reminderType === '1hour' && appointment.reminder_1hour_sent_at) {
      return NextResponse.json({ message: 'Reminder already sent' });
    }
    if (reminderType === '30min' && appointment.reminder_30min_sent_at) {
      return NextResponse.json({ message: 'Reminder already sent' });
    }

    // Fetch push subscription
    const { data: subData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', appointment.worker)
      .single();

    if (subError || !subData?.subscription) {
      return NextResponse.json({ error: 'No push subscription found' }, { status: 404 });
    }

    // Send notification
    const reminderTime = reminderType === '1hour' ? '1 hour' : '30 minutes';
    const payload = JSON.stringify({
      title: `⏰ Appointment in ${reminderTime}`,
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

    // Mark reminder as sent
    const updateField = reminderType === '1hour' 
      ? { reminder_1hour_sent_at: new Date().toISOString() }
      : { reminder_30min_sent_at: new Date().toISOString() };

    await supabase
      .from('appointments')
      .update(updateField)
      .eq('id', appointmentId);

    return NextResponse.json({ 
      success: true, 
      appointmentId, 
      reminderType,
      sentAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}