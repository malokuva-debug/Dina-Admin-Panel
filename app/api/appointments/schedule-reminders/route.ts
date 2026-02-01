import { NextResponse } from 'next/server';
import { createReminderCronJobs } from '@/lib/cronJobOrg';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { appointmentId, date, time } = await request.json();

    if (!appointmentId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get your Vercel deployment URL
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/trigger-reminder`;

    // Create cron jobs
    const result = await createReminderCronJobs(appointmentId, date, time, webhookUrl);

    if (result.success) {
      // Store cron job IDs in the appointment
      const jobIds = {
        cron_job_1hour: result.jobs.find(j => j.type === '1hour')?.jobId,
        cron_job_30min: result.jobs.find(j => j.type === '30min')?.jobId
      };

      await supabase
        .from('appointments')
        .update(jobIds)
        .eq('id', appointmentId);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error scheduling reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}