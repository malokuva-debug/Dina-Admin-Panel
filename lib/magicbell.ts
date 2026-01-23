// lib/magicbell.ts
'use client';
import MagicBell from 'magicbell-js/project-client';

const apiKey = process.env.NEXT_PUBLIC_MAGICBELL_API_KEY || '';
const apiSecret = process.env.MAGICBELL_API_SECRET || '';

if (!apiKey) {
  console.warn('MagicBell API key not found. Notifications will be disabled.');
}

// Initialize MagicBell client (server-side only)
export const magicbell = apiKey && apiSecret 
  ? new MagicBell({
      apiKey,
      apiSecret,
    })
  : null;

// Client-side notification helper
export const sendNotification = async (
  userId: string,
  title: string,
  content: string,
  actionUrl?: string
) => {
  if (!magicbell) {
    console.warn('MagicBell not configured');
    return null;
  }

  try {
    const notification = await magicbell.notifications.create({
      title,
      content,
      recipients: [{ external_id: userId }],
      action_url: actionUrl,
    });
    
    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
};

// Send appointment reminder
export const sendAppointmentReminder = async (
  userId: string,
  appointment: {
    service: string;
    date: string;
    time: string;
    worker: string;
  }
) => {
  return sendNotification(
    userId,
    'Appointment Reminder',
    `Your ${appointment.service} appointment with ${appointment.worker} is scheduled for ${appointment.date} at ${appointment.time}`,
    '/appointments'
  );
};

// Send new appointment notification to worker
export const notifyWorkerNewAppointment = async (
  worker: 'dina' | 'kida',
  appointment: {
    service: string;
    date: string;
    time: string;
    customerName?: string;
  }
) => {
  const userId = worker; // Use worker name as user ID
  const customerInfo = appointment.customerName ? ` for ${appointment.customerName}` : '';
  
  return sendNotification(
    userId,
    'New Appointment',
    `New ${appointment.service} appointment${customerInfo} on ${appointment.date} at ${appointment.time}`,
    '/appointments'
  );
};