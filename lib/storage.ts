// lib/storage.ts
// Unified storage layer - supports both localStorage and Supabase

import { supabase } from './supabase';
import { Appointment, Expense, Category, Service } from '@/types';

// Check if Supabase is configured
const isSupabaseEnabled = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Storage mode: 'supabase' or 'localStorage'
export const storageMode = isSupabaseEnabled() ? 'supabase' : 'localStorage';

console.log(`Using ${storageMode} for data storage`);

// LocalStorage fallback functions
const localStorageHelper = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// Unified storage API
export const storage = {
  // Generic get/set (for localStorage compatibility)
  get: <T>(key: string): T | null => localStorageHelper.get(key),
  set: <T>(key: string, value: T): void => localStorageHelper.set(key, value),
  remove: (key: string): void => localStorageHelper.remove(key),
  clear: (): void => localStorageHelper.clear(),
};

// Supabase-specific operations
export const db = {
  // Categories
  categories: {
    getAll: async (): Promise<Category[]> => {
      if (storageMode === 'localStorage') {
        return storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*, services(*)');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      
      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        services: cat.services || [],
      }));
    },

    create: async (category: Omit<Category, 'id' | 'services'>): Promise<Category | null> => {
      if (storageMode === 'localStorage') {
        const categories = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
        const newCategory: Category = {
          ...category,
          id: Date.now().toString(),
          services: [],
        };
        storage.set(STORAGE_KEYS.CATEGORIES, [...categories, newCategory]);
        return newCategory;
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: category.name }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating category:', error);
        return null;
      }
      
      return { ...data, services: [] };
    },

    delete: async (id: string): Promise<boolean> => {
      if (storageMode === 'localStorage') {
        const categories = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
        storage.set(STORAGE_KEYS.CATEGORIES, categories.filter(c => c.id !== id));
        return true;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      return !error;
    },
  },

  // Services
  services: {
    create: async (service: Omit<Service, 'id'>): Promise<Service | null> => {
      if (storageMode === 'localStorage') {
        const categories = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
        const newService: Service = { ...service, id: Date.now().toString() };
        const updated = categories.map(cat => {
          if (cat.id === service.category) {
            return { ...cat, services: [...cat.services, newService] };
          }
          return cat;
        });
        storage.set(STORAGE_KEYS.CATEGORIES, updated);
        return newService;
      }
      
      const { data, error } = await supabase
        .from('services')
        .insert([{
          name: service.name,
          price: service.price,
          duration: service.duration,
          category_id: service.category,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating service:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        price: data.price,
        duration: data.duration,
        category: data.category_id,
      };
    },

    update: async (id: string, updates: Partial<Service>): Promise<boolean> => {
      if (storageMode === 'localStorage') {
        const categories = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
        const updated = categories.map(cat => ({
          ...cat,
          services: cat.services.map(s => s.id === id ? { ...s, ...updates } : s),
        }));
        storage.set(STORAGE_KEYS.CATEGORIES, updated);
        return true;
      }
      
      const { error } = await supabase
        .from('services')
        .update({
          name: updates.name,
          price: updates.price,
          duration: updates.duration,
        })
        .eq('id', id);
      
      return !error;
    },

    delete: async (id: string): Promise<boolean> => {
      if (storageMode === 'localStorage') {
        const categories = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
        const updated = categories.map(cat => ({
          ...cat,
          services: cat.services.filter(s => s.id !== id),
        }));
        storage.set(STORAGE_KEYS.CATEGORIES, updated);
        return true;
      }
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      return !error;
    },
  },

  // Appointments
  appointments: {
    getAll: async (filters?: { worker?: string; month?: string }): Promise<Appointment[]> => {
      if (storageMode === 'localStorage') {
        let appointments = storage.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [];
        
        if (filters?.worker) {
          appointments = appointments.filter(a => a.worker === filters.worker);
        }
        
        if (filters?.month) {
          const [year, month] = filters.month.split('-');
          appointments = appointments.filter(a => {
            const [aYear, aMonth] = a.date.split('-');
            return aYear === year && aMonth === month;
          });
        }
        
        return appointments;
      }
      
      let query = supabase.from('appointments').select('*');
      
      if (filters?.worker) {
        query = query.eq('worker', filters.worker);
      }
      
      if (filters?.month) {
        const [year, month] = filters.month.split('-');
        query = query.gte('date', `${year}-${month}-01`)
                     .lt('date', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }
      
      return data;
    },

    create: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> => {
      if (storageMode === 'localStorage') {
        const appointments = storage.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [];
        const newAppointment: Appointment = {
          ...appointment,
          id: Date.now().toString(),
        };
        storage.set(STORAGE_KEYS.APPOINTMENTS, [...appointments, newAppointment]);
        return newAppointment;
      }
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating appointment:', error);
        return null;
      }
      
      return data;
    },

    delete: async (id: string): Promise<boolean> => {
      if (storageMode === 'localStorage') {
        const appointments = storage.get<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [];
        storage.set(STORAGE_KEYS.APPOINTMENTS, appointments.filter(a => a.id !== id));
        return true;
      }
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      return !error;
    },
  },

  // Expenses
  expenses: {
    getAll: async (filters?: { worker?: string; month?: string }): Promise<Expense[]> => {
      if (storageMode === 'localStorage') {
        let expenses = storage.get<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
        
        if (filters?.worker) {
          expenses = expenses.filter(e => e.worker === filters.worker);
        }
        
        if (filters?.month) {
          const [year, month] = filters.month.split('-');
          expenses = expenses.filter(e => {
            const [eYear, eMonth] = e.date.split('-');
            return eYear === year && eMonth === month;
          });
        }
        
        return expenses;
      }
      
      let query = supabase.from('expenses').select('*');
      
      if (filters?.worker) {
        query = query.eq('worker', filters.worker);
      }
      
      if (filters?.month) {
        const [year, month] = filters.month.split('-');
        query = query.gte('date', `${year}-${month}-01`)
                     .lt('date', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching expenses:', error);
        return [];
      }
      
      return data;
    },

    create: async (expense: Omit<Expense, 'id'>): Promise<Expense | null> => {
      if (storageMode === 'localStorage') {
        const expenses = storage.get<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
        const newExpense: Expense = {
          ...expense,
          id: Date.now().toString(),
        };
        storage.set(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);
        return newExpense;
      }
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating expense:', error);
        return null;
      }
      
      return data;
    },

    update: async (id: string, updates: Partial<Expense>): Promise<boolean> => {
      if (storageMode === 'localStorage') {
        const expenses = storage.get<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
        storage.set(
          STORAGE_KEYS.EXPENSES,
          expenses.map(e => (e.id === id ? { ...e, ...updates } : e))
        );
        return true;
      }
      
      const { error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id);
      
      return !error;
    },

    delete: async (id: string): Promise<boolean> => {
      if (storageMode === 'localStorage') {
        const expenses = storage.get<Expense[]>(STORAGE_KEYS.EXPENSES) || [];
        storage.set(STORAGE_KEYS.EXPENSES, expenses.filter(e => e.id !== id));
        return true;
      }
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      return !error;
    },
  },
};

// Storage keys (for localStorage mode)
export const STORAGE_KEYS = {
  SERVICES: 'services',
  CATEGORIES: 'categories',
  APPOINTMENTS: 'appointments',
  EXPENSES: 'expenses',
  BUSINESS_HOURS: 'businessHours',
  WEEKLY_DAYS_OFF: 'weeklyDaysOff',
  UNAVAILABLE_DATES: 'unavailableDates',
  UNAVAILABLE_TIMES: 'unavailableTimes',
  CURRENT_WORKER: 'currentWorker',
};