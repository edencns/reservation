import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Event, Reservation } from '../types';
import { getEvents, saveEvents, getReservations, saveReservations } from '../utils/storage';
import { SEED_EVENTS } from '../utils/seedData';

interface AppContextType {
  events: Event[];
  reservations: Reservation[];
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addReservation: (r: Reservation) => void;
  cancelReservation: (id: string) => void;
  checkIn: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  getEventBySlug: (slug: string) => Event | undefined;
  getUserReservations: (phone: string) => Reservation[];
  getEventReservationsByPhone: (eventId: string, phone: string) => Reservation[];
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    let stored = getEvents();
    if (stored.length === 0) {
      stored = SEED_EVENTS;
      saveEvents(stored);
    }
    return stored;
  });
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations());

  const addEvent = useCallback((event: Event) => {
    setEvents(prev => { const next = [...prev, event]; saveEvents(next); return next; });
  }, []);

  const updateEvent = useCallback((event: Event) => {
    setEvents(prev => { const next = prev.map(e => e.id === event.id ? event : e); saveEvents(next); return next; });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => { const next = prev.filter(e => e.id !== id); saveEvents(next); return next; });
    setReservations(prev => { const next = prev.filter(r => r.eventId !== id); saveReservations(next); return next; });
  }, []);

  const addReservation = useCallback((r: Reservation) => {
    setReservations(prev => { const next = [...prev, r]; saveReservations(next); return next; });
  }, []);

  const cancelReservation = useCallback((id: string) => {
    setReservations(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r);
      saveReservations(next);
      return next;
    });
  }, []);

  const checkIn = useCallback((id: string) => {
    setReservations(prev => {
      const next = prev.map(r =>
        r.id === id ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString() } : r
      );
      saveReservations(next);
      return next;
    });
  }, []);

  const getEventById = useCallback((id: string) => events.find(e => e.id === id), [events]);
  const getEventBySlug = useCallback((slug: string) => events.find(e => e.slug === slug), [events]);
  const getUserReservations = useCallback((phone: string) =>
    reservations.filter(r => r.customer.phone === phone), [reservations]);
  const getEventReservationsByPhone = useCallback((eventId: string, phone: string) =>
    reservations.filter(r => r.eventId === eventId && r.customer.phone === phone), [reservations]);

  return (
    <AppContext.Provider value={{
      events, reservations,
      addEvent, updateEvent, deleteEvent,
      addReservation, cancelReservation, checkIn,
      getEventById, getEventBySlug,
      getUserReservations, getEventReservationsByPhone,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
