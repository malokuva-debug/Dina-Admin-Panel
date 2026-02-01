const CRON_JOB_API_KEY = '6R5HFx6T93XdIh5EFU59On+Nb3vIFBLWyY/hJRocjbo=';
const CRON_JOB_API_URL = 'https://api.cron-job.org/jobs';

export async function createReminderCronJobs(
  appointmentId: string,
  date: string,
  time: string,
  webhookUrl: string // Your Vercel API endpoint
) {
  // Parse appointment time
  const [hours, minutes] = time.split(':').map(Number);
  const appointmentDate = new Date(`${date}T${time}:00-05:00`); // NY timezone (EST)

  // Calculate 1 hour before
  const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
  
  // Calculate 30 minutes before
  const thirtyMinsBefore = new Date(appointmentDate.getTime() - 30 * 60 * 1000);

  const jobs = [];

  // Create 1-hour reminder cron job
  const oneHourCron = {
    job: {
      title: `Reminder 1hr - Appointment ${appointmentId}`,
      url: `${webhookUrl}?appointmentId=${appointmentId}&type=1hour`,
      enabled: true,
      schedule: {
        timezone: 'America/New_York',
        expiresAt: Math.floor(oneHourBefore.getTime() / 1000) + 300, // Expires 5 min after trigger
        hours: [oneHourBefore.getHours()],
        minutes: [oneHourBefore.getMinutes()],
        mdays: [oneHourBefore.getDate()],
        months: [oneHourBefore.getMonth() + 1]
      },
      requestMethod: 'GET',
      extendedData: {
        headers: [
          {
            key: 'Authorization',
            value: `Bearer ${process.env.CRON_SECRET}`
          }
        ]
      }
    }
  };

  // Create 30-minute reminder cron job
  const thirtyMinCron = {
    job: {
      title: `Reminder 30min - Appointment ${appointmentId}`,
      url: `${webhookUrl}?appointmentId=${appointmentId}&type=30min`,
      enabled: true,
      schedule: {
        timezone: 'America/New_York',
        expiresAt: Math.floor(thirtyMinsBefore.getTime() / 1000) + 300,
        hours: [thirtyMinsBefore.getHours()],
        minutes: [thirtyMinsBefore.getMinutes()],
        mdays: [thirtyMinsBefore.getDate()],
        months: [thirtyMinsBefore.getMonth() + 1]
      },
      requestMethod: 'GET',
      extendedData: {
        headers: [
          {
            key: 'Authorization',
            value: `Bearer ${process.env.CRON_SECRET}`
          }
        ]
      }
    }
  };

  try {
    // Create 1-hour reminder job
    const response1h = await fetch(CRON_JOB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CRON_JOB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(oneHourCron)
    });

    const result1h = await response1h.json();
    jobs.push({ type: '1hour', jobId: result1h.jobId, success: response1h.ok });

    // Create 30-minute reminder job
    const response30m = await fetch(CRON_JOB_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CRON_JOB_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(thirtyMinCron)
    });

    const result30m = await response30m.json();
    jobs.push({ type: '30min', jobId: result30m.jobId, success: response30m.ok });

    return { success: true, jobs };
  } catch (error) {
    console.error('Error creating cron jobs:', error);
    return { success: false, error };
  }
}

export async function deleteCronJob(jobId: string) {
  try {
    const response = await fetch(`${CRON_JOB_API_URL}/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CRON_JOB_API_KEY}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting cron job:', error);
    return false;
  }
}