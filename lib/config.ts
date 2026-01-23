// lib/config.ts
// Application configuration
import { BusinessHours } from '@/types'; // ← IMPORT THE TYPE

export const BUSINESS_CONFIG: BusinessHours = {
  open: '09:00',
  close: '17:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
};

export const DAYS_OF_WEEK = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Admin Panel',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  workers: ['dina', 'kida'] as const,

  businessDefaults: BUSINESS_CONFIG,

  appointment: {
    defaultDuration: 30, // minutes
    minDuration: 15,
    maxDuration: 240,
    slotInterval: 15, // Time slot intervals in minutes
  },

  finance: {
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 0, // Set to 0.1 for 10% tax
  },

  notifications: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    reminderHours: 24, // Send reminder 24 hours before appointment
  },

  pdf: {
    companyName: 'Your Business Name',
    companyAddress: '123 Main St, City, State 12345',
    companyPhone: '(555) 123-4567',
    companyEmail: 'info@yourbusiness.com',
  },

  features: {
    pwa: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    multiWorker: true,
    expenseTracking: true,
    customerManagement: false, // Future feature
  },

  storage: {
    mode: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'supabase' : 'localStorage',
  },

  dateFormat: {
    short: 'MMM dd, yyyy',
    long: 'MMMM dd, yyyy',
    time: 'h:mm a',
  },
};

// Time utilities
export const timeSlots = {
  generate: (start: string, end: string, interval: number = 15): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      slots.push(`${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}`);
      currentMinutes += interval;
    }

    return slots;
  },

  format: (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2,'0')} ${ampm}`;
  },

  addMinutes: (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2,'0')}:${newMins.toString().padStart(2,'0')}`;
  },
};

// Date utilities
export const dateUtils = {
  format: (date: string | Date, format: 'short' | 'long' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    if (format === 'short') {
      return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    }
    return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  },

  today: (): string => new Date().toISOString().split('T')[0],

  currentMonth: (): string => new Date().toISOString().slice(0,7),

  isPast: (date: string): boolean => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkDate = new Date(date + 'T00:00:00');
    return checkDate < today;
  },

  getDayOfWeek: (date: string): number => new Date(date + 'T00:00:00').getDay(),

  getDayName: (date: string): string => DAYS_OF_WEEK[dateUtils.getDayOfWeek(date)],
};

export default config;