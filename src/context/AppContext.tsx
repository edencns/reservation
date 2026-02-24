import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Event, Reservation, CompanyInfo } from '../types';
import { getEvents, saveEvents, getReservations, saveReservations, getCompanyInfo, saveCompanyInfo } from '../utils/storage';
import { SEED_EVENTS } from '../utils/seedData';
import {
  apiGetEvents,
  apiCreateEvent,
  apiUpdateEvent,
  apiDeleteEvent,
  apiGetReservations,
  apiCreateReservation,
  apiCancelReservation,
  apiCheckInReservation,
} from '../utils/cloudApi';

interface AppContextType {
  events: Event[];
  reservations: Reservation[];
  companyInfo: CompanyInfo;
  isLoading: boolean;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addReservation: (r: Reservation) => void;
  cancelReservation: (id: string) => void;
  checkIn: (id: string) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
  getEventById: (id: string) => Event | undefined;
  getEventBySlug: (slug: string) => Event | undefined;
  getUserReservations: (phone: string) => Reservation[];
  getEventReservationsByPhone: (eventId: string, phone: string) => Reservation[];
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>(() => {
    let stored = getEvents();
    if (stored.length === 0) {
      stored = SEED_EVENTS;
      saveEvents(stored);
    }
    return stored;
  });
  const [reservations, setReservations] = useState<Reservation[]>(() => getReservations());
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => getCompanyInfo());

  useEffect(() => {
    let disposed = false;

    const syncFromCloudflare = async () => {
      try {
        const [remoteEvents, remoteReservations] = await Promise.all([
          apiGetEvents(),
          apiGetReservations(),
        ]);
        if (disposed) return;

        // If server is empty but local has data, bootstrap once.
        if (remoteEvents.length === 0 && events.length > 0) {
          await Promise.all(events.map(e => apiCreateEvent(e)));
        }
        if (remoteReservations.length === 0 && reservations.length > 0) {
          await Promise.all(reservations.map(r => apiCreateReservation(r)));
        }

        const [afterEvents, afterReservations] = await Promise.all([
          apiGetEvents(),
          apiGetReservations(),
        ]);
        if (disposed) return;

        setEvents(afterEvents);
        setReservations(afterReservations);
        saveEvents(afterEvents);
        saveReservations(afterReservations);
      } catch {
        // Keep localStorage fallback for local dev / API unavailable environments.
      } finally {
        if (!disposed) setIsLoading(false);
      }
    };

    void syncFromCloudflare();
    return () => {
      disposed = true;
    };
  }, []);

  const addEvent = useCallback((event: Event) => {
    setEvents(prev => {
      const next = [...prev, event];
      saveEvents(next);
      return next;
    });
    void apiCreateEvent(event).catch(() => undefined);
  }, []);

  const updateEvent = useCallback((event: Event) => {
    setEvents(prev => {
      const next = prev.map(e => e.id === event.id ? event : e);
      saveEvents(next);
      return next;
    });
    void apiUpdateEvent(event).catch(() => undefined);
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      saveEvents(next);
      return next;
    });
    setReservations(prev => {
      const next = prev.filter(r => r.eventId !== id);
      saveReservations(next);
      return next;
    });
    void apiDeleteEvent(id).catch(() => undefined);
  }, []);

  const addReservation = useCallback((r: Reservation) => {
    setReservations(prev => {
      const next = [...prev, r];
      saveReservations(next);
      return next;
    });
    void apiCreateReservation(r).catch(() => undefined);
  }, []);

  const cancelReservation = useCallback((id: string) => {
    setReservations(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r);
      saveReservations(next);
      return next;
    });
    void apiCancelReservation(id).catch(() => undefined);
  }, []);

  const checkIn = useCallback((id: string) => {
    const checkedInAt = new Date().toISOString();
    setReservations(prev => {
      const next = prev.map(r =>
        r.id === id ? { ...r, checkedIn: true, checkedInAt } : r
      );
      saveReservations(next);
      return next;
    });
    void apiCheckInReservation(id, checkedInAt).catch(() => undefined);
  }, []);

  const updateCompanyInfo = useCallback((info: CompanyInfo) => {
    setCompanyInfo(info);
    saveCompanyInfo(info);
  }, []);

  const getEventById = useCallback((id: string) => events.find(e => e.id === id), [events]);
  const getEventBySlug = useCallback((slug: string) => events.find(e => e.slug === slug), [events]);
  const getUserReservations = useCallback((phone: string) =>
    reservations.filter(r => r.customer.phone === phone), [reservations]);
  const getEventReservationsByPhone = useCallback((eventId: string, phone: string) =>
    reservations.filter(r => r.eventId === eventId && r.customer.phone === phone), [reservations]);

  return (
    <AppContext.Provider value={{
      events, reservations, companyInfo, isLoading,
      addEvent, updateEvent, deleteEvent,
      addReservation, cancelReservation, checkIn,
      updateCompanyInfo,
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
