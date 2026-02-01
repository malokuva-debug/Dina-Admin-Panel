'use client';

import { Worker } from '@/types';
import ServicesSection from './ServicesSection';
import BusinessHours from './BusinessHours';
import WeeklyDaysOff from './WeeklyDaysOff';
import UnavailableDates from './UnavailableDates';
import UnavailableTimes from './UnavailableTimes';

interface SettingsSectionProps {
  worker: Worker;
}

export default function SettingsSection({ worker }: SettingsSectionProps) {
  const enableNotifications = async () => {
    const { requestNotificationPermission, registerServiceWorker, subscribeToPush, saveSubscription } = await import('@/lib/notifications');
    
    try {
      const permission = await requestNotificationPermission();
      
      if (permission !== 'granted') {
        alert('Please allow notifications in your browser settings');
        return;
      }

      const registration = await registerServiceWorker();
      if (!registration) {
        alert('Failed to register service worker');
        return;
      }

      const subscription = await subscribeToPush(registration);
      if (!subscription) {
        alert('Failed to create push subscription');
        return;
      }

      const saved = await saveSubscription(subscription, worker);
      if (!saved) {
        alert('Failed to save subscription');
        return;
      }

      alert('Notifications enabled successfully! You will receive push notifications for new appointments.');
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications. Check console for details.');
    }
  };

  return (
    <div id="settings">
      <ServicesSection />
      <BusinessHours worker={worker} />
      <WeeklyDaysOff worker={worker} />
      <UnavailableDates worker={worker} />
      <UnavailableTimes worker={worker} />

      <button
        id="enableNotificationsBtn"
        className="btn-primary"
        onClick={enableNotifications}
        style={{ marginTop: '20px' }}
      >
        Enable Notifications
      </button>
export default function ResetPasswordButton() {
  const resetPassword = async () => {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '6d8a7f6b-4de3-44b1-9ddd-568086ce2529',
        newPassword: 'dinakida',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
    } else {
      alert('Password reset successfully');
    }
  };

  return (
    <button onClick={resetPassword}>
      Reset Password
    </button>
  );
}
    </div>
  );
}