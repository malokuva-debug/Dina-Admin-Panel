// lib/notifications.ts
// Web Push Notifications using service workers

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 
         'Notification' in window && 
         'serviceWorker' in navigator &&
         'PushManager' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  return await Notification.requestPermission();
};

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Subscribe to push notifications
export const subscribeToPush = async (
  registration: ServiceWorkerRegistration
): Promise<globalThis.PushSubscription | null> => {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('Push subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
};

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)

  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Save subscription to server
export const saveSubscription = async (
  subscription: globalThis.PushSubscription,
  userId: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        userId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to save subscription:', error);
    return false;
  }
};

// Send notification via API
export const sendNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<boolean> => {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        data,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
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
): Promise<boolean> => {
  return sendNotification(
    userId,
    'Appointment Reminder',
    `Your ${appointment.service} appointment with ${appointment.worker} is scheduled for ${appointment.date} at ${appointment.time}`,
    { type: 'appointment', appointment }
  );
};

// Notify worker of new appointment
export const notifyWorkerNewAppointment = async (
  worker: 'dina' | 'kida',
  appointment: {
    service: string;
    date: string;
    time: string;
    customerName?: string;
  }
): Promise<boolean> => {
  const customerInfo = appointment.customerName ? ` for ${appointment.customerName}` : '';
  
  return sendNotification(
    worker,
    'New Appointment',
    `New ${appointment.service} appointment${customerInfo} on ${appointment.date} at ${appointment.time}`,
    { type: 'new_appointment', appointment }
  );
};

// Show local notification (doesn't require service worker)
export const showLocalNotification = (title: string, options?: NotificationOptions): void => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
};
