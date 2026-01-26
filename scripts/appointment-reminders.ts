import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function sendReminders() {
  const now = new Date()
  const in30Min = new Date(now.getTime() + 30 * 60 * 1000)
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000)

  const times = [in30Min, in1Hour]

  for (const time of times) {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'confirmed') // only confirmed appointments
      .gte('date_time', new Date(now.getTime()))
      .lte('date_time', new Date(time.getTime()))

    if (error) {
      console.error('Error fetching appointments:', error)
      continue
    }

    for (const appointment of appointments) {
      await fetch('https://dina-admin-panel.vercel.app/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: appointment.user_id,
          title: 'Appointment Reminder',
          body: `Reminder: Your ${appointment.service} appointment is at ${appointment.date} ${appointment.time}`,
          data: appointment
        })
      })
    }
  }
}

// Call immediately for testing
sendReminders()

// Later: run every 5 min with cron job or setInterval
