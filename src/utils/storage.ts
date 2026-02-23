import type { Event, Reservation, SeatAvailability } from '../types';

const EVENTS_KEY = 'rv_events';
const RESERVATIONS_KEY = 'rv_reservations';
const AVAILABILITY_KEY = 'rv_availability';
const ADMIN_AUTH_KEY = 'rv_admin_auth';

export const getEvents = (): Event[] => {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]'); } catch { return []; }
};
export const saveEvents = (events: Event[]) =>
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

export const getReservations = (): Reservation[] => {
  try { return JSON.parse(localStorage.getItem(RESERVATIONS_KEY) || '[]'); } catch { return []; }
};
export const saveReservations = (reservations: Reservation[]) =>
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));

export const getAvailability = (): SeatAvailability[] => {
  try { return JSON.parse(localStorage.getItem(AVAILABILITY_KEY) || '[]'); } catch { return []; }
};
export const saveAvailability = (av: SeatAvailability[]) =>
  localStorage.setItem(AVAILABILITY_KEY, JSON.stringify(av));

export const getReservedSeats = (eventId: string, date: string, time: string): string[] => {
  const all = getAvailability();
  return all.find(a => a.eventId === eventId && a.date === date && a.time === time)?.reservedSeats ?? [];
};

export const addReservedSeats = (eventId: string, date: string, time: string, seats: string[]) => {
  const all = getAvailability();
  const idx = all.findIndex(a => a.eventId === eventId && a.date === date && a.time === time);
  if (idx >= 0) {
    all[idx].reservedSeats = [...new Set([...all[idx].reservedSeats, ...seats])];
  } else {
    all.push({ eventId, date, time, reservedSeats: seats });
  }
  saveAvailability(all);
};

export const removeReservedSeats = (eventId: string, date: string, time: string, seats: string[]) => {
  const all = getAvailability();
  const idx = all.findIndex(a => a.eventId === eventId && a.date === date && a.time === time);
  if (idx >= 0) {
    all[idx].reservedSeats = all[idx].reservedSeats.filter(s => !seats.includes(s));
    saveAvailability(all);
  }
};

export const isAdminLoggedIn = (): boolean =>
  localStorage.getItem(ADMIN_AUTH_KEY) === 'true';

export const adminLogin = (username: string, password: string): boolean => {
  if (username === 'admin' && password === 'admin123') {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return true;
  }
  return false;
};

export const adminLogout = () => localStorage.removeItem(ADMIN_AUTH_KEY);
