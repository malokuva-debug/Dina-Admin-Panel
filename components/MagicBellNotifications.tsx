'use client';

import { useEffect, useState } from 'react';
import { Worker } from '@/types';

interface MagicBellNotificationsProps {
  worker: Worker;
}

export default function MagicBellNotifications({ worker }: MagicBellNotificationsProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAGICBELL_API_KEY;

    if (!apiKey) {
      console.warn('MagicBell API key not configured');
      return;
    }

    // Load MagicBell script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@magicbell/embeddable@latest/dist/magicbell.min.js';
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const apiKey = process.env.NEXT_PUBLIC_MAGICBELL_API_KEY;
    if (!apiKey) return;

    // Initialize MagicBell
    // @ts-ignore
    if (window.MagicBell) {
      // @ts-ignore
      window.MagicBell.init({
        apiKey: apiKey,
        userExternalId: worker, // Use worker name as user ID
        defaultIsOpen: false,
      });
    }
  }, [isLoaded, worker]);

  if (!process.env.NEXT_PUBLIC_MAGICBELL_API_KEY) {
    return null;
  }

  return (
    <div
      id="notifications-inbox"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
      }}
    >
      {/* MagicBell will render here */}
      <div id="magicbell-notification-inbox"></div>
    </div>
  );
}