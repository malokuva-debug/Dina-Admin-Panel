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
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      alert('Notifications are already enabled');
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will now receive appointment reminders',
        });
      }
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
    </div>
  );
}