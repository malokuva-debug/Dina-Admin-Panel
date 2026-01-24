'use client';

import { useEffect, useState } from 'react';
import { Worker } from '@/types';
import {
  isNotificationSupported,
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPush,
  saveSubscription,
} from '@/lib/notifications';

interface PushNotificationsProps {
  worker: Worker;
}

export default function PushNotifications({ worker }: PushNotificationsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(isNotificationSupported());
    
    if (isNotificationSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    try {
      setError(null);

      // Request permission
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Notification permission denied');
        return;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setError('Failed to register service worker');
        return;
      }

      // Subscribe to push notifications
      const subscription = await subscribeToPush(registration);
      if (!subscription) {
        setError('Failed to create push subscription');
        return;
      }

      // Save subscription to server
      const saved = await saveSubscription(subscription, worker);
      if (!saved) {
        setError('Failed to save subscription');
        return;
      }

      setIsSubscribed(true);
      alert('Push notifications enabled successfully!');
    } catch (err) {
      console.error('Error enabling notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (!isSupported) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 16px',
          background: '#ff3b30',
          borderRadius: '8px',
          fontSize: '13px',
          zIndex: 1000,
        }}
      >
        Notifications blocked. Enable in browser settings.
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 16px',
          background: '#34c759',
          borderRadius: '8px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        Notifications enabled
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            background: '#ff3b30',
            borderRadius: '8px',
            fontSize: '13px',
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}
    </>
  );
}