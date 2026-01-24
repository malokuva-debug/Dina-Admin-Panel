import { useState } from 'react';
import { sendNotification, notifyWorkerNewAppointment } from '@/lib/notifications';

export function useNotifications() {
  const [isSending, setIsSending] = useState(false);

  const send = async (
    userId: string,
    title: string,
    body: string,
    data?: any
  ) => {
    setIsSending(true);
    
    try {
      const success = await sendNotification(userId, title, body, data);
      return success;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
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
    setIsSending(true);
    
    try {
      const success = await notifyWorkerNewAppointment(worker, appointment);
      return success;
    } catch (error) {
      console.error('Error sending appointment notification:', error);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    send,
    notifyNewAppointment,
    isSending,
  };
}