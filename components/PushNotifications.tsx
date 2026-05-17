// PushNotifications.tsx
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

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(isNotificationSupported());
    
    if (isNotificationSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  // This component just checks support and permission status
  // The actual subscription happens in SettingsSection
  
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
          color: 'white',
          borderRadius: '8px',
          fontSize: '13px',
          zIndex: 1000,
        }}
      >
        Notifications blocked. Enable in browser settings.
      </div>
    );
  }

  return null;
}