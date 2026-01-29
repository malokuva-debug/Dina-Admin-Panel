// types/index.ts

export type Worker = 'dina' | 'kida';

export interface User {
  id: string;
  name: string;
  role: 'admin' | Worker; // admin or one of your workers ('dina' | 'kida')
}

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

export interface Expense {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  date: string;
  worker?: Worker;
}

export interface Appointment {
  id: string;
  worker: Worker;
  service: string;
  date: string;
  time: string;
  price: number;
  duration?: number;
  customerName?: string;
  customerPhone?: string;
  is_done?: boolean;
}

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

export interface FinanceData {
  today: number;
  month: number;
  total: number;
  byWorker: {
    dina: number;
    kida: number;
  };
}
