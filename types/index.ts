// types/index.ts

// ----------------------
// Core enums / unions
// ----------------------
export type Worker = 'dina' | 'kida';
export type Role = 'admin' | 'worker';
export type AppointmentStatus = 'pending' | 'confirmed' | 'arrived' | 'done';

// ----------------------
// Auth / User
// ----------------------
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  worker?: Worker;
}

// ----------------------
// Services & Categories
// ----------------------
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  category_id: string;
}

export interface Category {
  id: string;
  name: string;
  services: Service[];
}

// ----------------------
// Appointments & Finance
// ----------------------
export interface Appointment {
  id: string;
  worker: Worker;
  service: string;
  date: string;
  time: string;
  price: number;
  duration?: number;
  customer_name?: string;
  customer_phone?: string;
  is_done?: boolean;
  client_id?: string;
  status?: AppointmentStatus;
  estimated_completion_time?: string;
  reminder_sent?: boolean;
  created_at?: string;

  // ✅ ADD THESE
  additional_services?: {
    name: string;
    price: number;
  }[];

  discount_applied?: boolean;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  date: string;
  worker?: Worker;
}

export interface FinanceData {
  today: number;
  month: number;
  total: number;
  byWorker: Record<Worker, number>;
}

export interface Client {
  id: string;
  name: string;
  phone?: string | null;
  email?: string;
  image?: string | null;
}

// ----------------------
// Business settings
// ----------------------
export interface BusinessHours {
  open: string;
  close: string;
  lunchStart: string;
  lunchEnd: string;
}

export type BusinessHoursState = {
  open: string;
  close: string;
  lunchEnabled: boolean;
  lunchStart: string;
  lunchEnd: string;
};

export interface UnavailableDate {
  id: string;
  date: string;
  worker: Worker;
}

export interface UnavailableTime {
  id: string;
  date: string;
  start: string;
  end: string;
  worker: Worker;
}

export interface WeeklyDaysOff {
  [key: string]: boolean;
}