import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'; // Node.js fetch
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Role key for full access
)

supabase
  .channel('appointments')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'appointments' },
    async (payload) => {
      const appointment = payload.new
      console.log('New appointment:', appointment)

      // Send notification
      await fetch('https://dina-admin-panel.vercel.app/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: appointment.user_id,
          title: 'New Appointment',
          body: `You have a new appointment for ${appointment.service} at ${appointment.date} ${appointment.time}`,
          data: appointment
        })
      })
    }
  )
  .subscribe()
