// hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  BusinessHours, 
  WeeklyDaysOff, 
  UnavailableDate, 
  UnavailableTime, 
  Worker 
} from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { BUSINESS_CONFIG, DAYS_OF_WEEK } from '@/lib/config';

interface UseSettingsOptions {
  worker?: Worker;
}

export function useSettings(options: UseSettingsOptions = {}) {
  const { worker } = options;

  // -----------------------------
  // Business Hours
  // -----------------------------
  const [businessHours, setBusinessHours] = useState<BusinessHours>(BUSINESS_CONFIG);

  const loadBusinessHours = useCallback(() => {
    if (!worker) return;

    const saved = storage.get<Record<Worker, BusinessHours>>(STORAGE_KEYS.BUSINESS_HOURS);
    if (saved && saved[worker]) {
      setBusinessHours(saved[worker]);
    } else {
      setBusinessHours(BUSINESS_CONFIG);
    }
  }, [worker]);

  const saveBusinessHours = useCallback((hours: BusinessHours) => {
    if (!worker) return false;

    try {
      const allHours = storage.get<Record<Worker, BusinessHours>>(STORAGE_KEYS.BUSINESS_HOURS) || {
        dina: BUSINESS_CONFIG,
        kida: BUSINESS_CONFIG,
      };

      allHours[worker] = hours;
      storage.set(STORAGE_KEYS.BUSINESS_HOURS, allHours);
      setBusinessHours(hours);
      return true;
    } catch (error) {
      console.error('Error saving business hours:', error);
      return false;
    }
  }, [worker]);

  // -----------------------------
  // Weekly Days Off
  // -----------------------------
  const [weeklyDaysOff, setWeeklyDaysOff] = useState<WeeklyDaysOff>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {} as WeeklyDaysOff)
  );

  const loadWeeklyDaysOff = useCallback(() => {
    if (!worker) return;

    const saved = storage.get<Record<Worker, WeeklyDaysOff>>(STORAGE_KEYS.WEEKLY_DAYS_OFF);
    if (saved && saved[worker]) {
      setWeeklyDaysOff(saved[worker]);
    } else {
      setWeeklyDaysOff(
        DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {} as WeeklyDaysOff)
      );
    }
  }, [worker]);

  const saveWeeklyDaysOff = useCallback((days: WeeklyDaysOff) => {
    if (!worker) return false;

    try {
      const allDays = storage.get<Record<Worker, WeeklyDaysOff>>(STORAGE_KEYS.WEEKLY_DAYS_OFF) || {
        dina: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {} as WeeklyDaysOff),
        kida: DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: false }), {} as WeeklyDaysOff),
      };

      allDays[worker] = days;
      storage.set(STORAGE_KEYS.WEEKLY_DAYS_OFF, allDays);
      setWeeklyDaysOff(days);
      return true;
    } catch (error) {
      console.error('Error saving weekly days off:', error);
      return false;
    }
  }, [worker]);

  // -----------------------------
  // Unavailable Dates
  // -----------------------------
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);

  const loadUnavailableDates = useCallback(() => {
    if (!worker) return;

    const saved: UnavailableDate[] = storage.get(STORAGE_KEYS.UNAVAILABLE_DATES) || [];
    const filtered = saved.filter(d => d.worker === worker);
    filtered.sort((a, b) => a.date.localeCompare(b.date));
    setUnavailableDates(filtered);
  }, [worker]);

  const addUnavailableDate = useCallback((date: string) => {
    if (!worker) return false;

    try {
      const allDates: UnavailableDate[] = storage.get(STORAGE_KEYS.UNAVAILABLE_DATES) || [];
      const exists = allDates.some(d => d.date === date && d.worker === worker);
      if (exists) return false;

      const newDate: UnavailableDate = {
        id: Date.now().toString(),
        date,
        worker,
      };

      storage.set(STORAGE_KEYS.UNAVAILABLE_DATES, [...allDates, newDate]);
      loadUnavailableDates();
      return true;
    } catch (error) {
      console.error('Error adding unavailable date:', error);
      return false;
    }
  }, [worker, loadUnavailableDates]);

  const removeUnavailableDate = useCallback((id: string) => {
    try {
      const allDates: UnavailableDate[] = storage.get(STORAGE_KEYS.UNAVAILABLE_DATES) || [];
      storage.set(
        STORAGE_KEYS.UNAVAILABLE_DATES,
        allDates.filter(d => d.id !== id)
      );
      loadUnavailableDates();
      return true;
    } catch (error) {
      console.error('Error removing unavailable date:', error);
      return false;
    }
  }, [loadUnavailableDates]);

  // -----------------------------
  // Unavailable Times
  // -----------------------------
  const [unavailableTimes, setUnavailableTimes] = useState<UnavailableTime[]>([]);

  const loadUnavailableTimes = useCallback(() => {
    if (!worker) return;

    const saved: UnavailableTime[] = storage.get(STORAGE_KEYS.UNAVAILABLE_TIMES) || [];
    const filtered = saved.filter(t => t.worker === worker);

    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.start.localeCompare(b.start);
    });

    setUnavailableTimes(filtered);
  }, [worker]);

  const addUnavailableTime = useCallback((date: string, start: string, end: string) => {
    if (!worker) return false;

    try {
      const newTime: UnavailableTime = {
        id: Date.now().toString(),
        date,
        start,
        end,
        worker,
      };

      const allTimes: UnavailableTime[] = storage.get(STORAGE_KEYS.UNAVAILABLE_TIMES) || [];
      storage.set(STORAGE_KEYS.UNAVAILABLE_TIMES, [...allTimes, newTime]);
      loadUnavailableTimes();
      return true;
    } catch (error) {
      console.error('Error adding unavailable time:', error);
      return false;
    }
  }, [worker, loadUnavailableTimes]);

  const removeUnavailableTime = useCallback((id: string) => {
    try {
      const allTimes: UnavailableTime[] = storage.get(STORAGE_KEYS.UNAVAILABLE_TIMES) || [];
      storage.set(
        STORAGE_KEYS.UNAVAILABLE_TIMES,
        allTimes.filter(t => t.id !== id)
      );
      loadUnavailableTimes();
      return true;
    } catch (error) {
      console.error('Error removing unavailable time:', error);
      return false;
    }
  }, [loadUnavailableTimes]);

  // -----------------------------
  // Availability Checkers
  // -----------------------------
  const isDateAvailable = useCallback((date: string): boolean => {
    if (!worker) return true;

    const dateObj = new Date(date + 'T00:00:00');
    const dayName = DAYS_OF_WEEK[dateObj.getDay()];
    if (weeklyDaysOff[dayName]) return false;

    return !unavailableDates.some(d => d.date === date);
  }, [worker, weeklyDaysOff, unavailableDates]);

  const isTimeSlotAvailable = useCallback((date: string, time: string, duration: number = 30): boolean => {
    if (!worker) return true;

    const requestedStart = new Date(`${date}T${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    return !unavailableTimes.some(ut => {
      if (ut.date !== date) return false;

      const blockStart = new Date(`${date}T${ut.start}`);
      const blockEnd = new Date(`${date}T${ut.end}`);

      return (
        (requestedStart >= blockStart && requestedStart < blockEnd) ||
        (requestedEnd > blockStart && requestedEnd <= blockEnd) ||
        (requestedStart <= blockStart && requestedEnd >= blockEnd)
      );
    });
  }, [worker, unavailableTimes]);

  // -----------------------------
  // Load settings on mount
  // -----------------------------
  useEffect(() => {
    if (worker) {
      loadBusinessHours();
      loadWeeklyDaysOff();
      loadUnavailableDates();
      loadUnavailableTimes();
    }
  }, [worker, loadBusinessHours, loadWeeklyDaysOff, loadUnavailableDates, loadUnavailableTimes]);

  // -----------------------------
  // Return all hooks
  // -----------------------------
  return {
    businessHours,
    saveBusinessHours,
    loadBusinessHours,

    weeklyDaysOff,
    saveWeeklyDaysOff,
    loadWeeklyDaysOff,

    unavailableDates,
    addUnavailableDate,
    removeUnavailableDate,
    loadUnavailableDates,

    unavailableTimes,
    addUnavailableTime,
    removeUnavailableTime,
    loadUnavailableTimes,

    isDateAvailable,
    isTimeSlotAvailable,
  };
}