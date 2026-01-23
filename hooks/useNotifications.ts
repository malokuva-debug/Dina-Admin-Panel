import { useState } from 'react';

interface NotificationData {
  title: string;
  content: string;
  actionUrl?: string;
}

export function useNotifications() {
  const [isSending, setIsSending] = useState(false);

  const sendNotification = async (
    userId: string,
    type: 'new_appointment' | 'custom',
    data: NotificationData | any
  ) => {
    setIsSending(true);
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          userId,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const notifyNewAppointment = async (
    worker: 'dina' | 'kida',
    appointment: {
      service: string;
      date: string;
      time: string;
      customerName?: string;
    }
  ) => {
    return sendNotification(worker, 'new_appointment', appointment);
  };

  const notifyCustom = async (
    userId: string,
    title: string,
    content: string,
    actionUrl?: string
  ) => {
    return sendNotification(userId, 'custom', {
      title,
      content,
      actionUrl,
    });
  };

  return {
    sendNotification,
    notifyNewAppointment,
    notifyCustom,
    isSending,
  };
}