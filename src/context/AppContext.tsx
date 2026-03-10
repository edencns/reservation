import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Event, Reservation, CompanyInfo, ManagedVendor } from '../types';
import { getEvents, saveEvents, getReservations, saveReservations, getCompanyInfo, saveCompanyInfo, getManagedVendors, saveManagedVendors } from '../utils/storage';
import { SEED_EVENTS } from '../utils/seedData';
import {
  apiGetEvents,
  apiCreateEvent,
  apiUpdateEvent,
  apiDeleteEvent,
  apiGetReservations,
  apiCreateReservation,
  apiCancelReservation,
  apiDeleteReservation,
  apiCheckInReservation,
} from '../utils/cloudApi';

interface AppContextType {
  events: Event[];
  reservations: Reservation[];
  companyInfo: CompanyInfo;
  managedVendors: ManagedVendor[];
  isLoading: boolean;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addReservation: (r: Reservation) => void;
  cancelReservation: (id: string) => void;
  deleteReservation: (id: string) => void;
  checkIn: (id: string) => void;
  updateCompanyInfo: (info: CompanyInfo) => void;
  addManagedVendor: (v: ManagedVendor) => void;
  updateManagedVendor: (v: ManagedVendor) => void;
  deleteManagedVendor: (id: string) => void;
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
  const [managedVendors, setManagedVendors] = useState<ManagedVendor[]>(() => getManagedVendors());

  useEffect(() => {
    let disposed = false;

    const syncFromCloudflare = async () => {
      try {
        const [remoteEvents, remoteReservations] = await Promise.all([
          apiGetEvents(),
          apiGetReservations(),
        ]);
        if (disposed) return;

        // Sync any local events/reservations not yet in remote.
        const remoteEventIds = new Set(remoteEvents.map(e => e.id));
        const localOnlyEvents = events.filter(e => !remoteEventIds.has(e.id));
        if (localOnlyEvents.length > 0) {
          await Promise.all(localOnlyEvents.map(e => apiCreateEvent(e)));
        }
        const remoteResIds = new Set(remoteReservations.map(r => r.id));
        const localOnlyRes = reservations.filter(r => !remoteResIds.has(r.id));
        if (localOnlyRes.length > 0) {
          await Promise.all(localOnlyRes.map(r => apiCreateReservation(r)));
        }

        const [afterEvents, afterReservations] = await Promise.all([
          apiGetEvents(),
          apiGetReservations(),
        ]);
        if (disposed) return;

        // 로컬에 없는 원격 데이터만 추가 (로컬 변경사항 보존)
        setEvents(prev => {
          const localIds = new Set(prev.map(e => e.id));
          const newFromRemote = afterEvents.filter(e => !localIds.has(e.id));
          if (newFromRemote.length === 0) return prev;
          const merged = [...prev, ...newFromRemote];
          saveEvents(merged);
          return merged;
        });
        setReservations(prev => {
          const localIds = new Set(prev.map(r => r.id));
          const newFromRemote = afterReservations.filter(r => !localIds.has(r.id));
          if (newFromRemote.length === 0) return prev;
          const merged = [...prev, ...newFromRemote];
          saveReservations(merged);
          return merged;
        });
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

  const deleteReservation = useCallback((id: string) => {
    setReservations(prev => {
      const next = prev.filter(r => r.id !== id);
      saveReservations(next);
      return next;
    });
    void apiDeleteReservation(id).catch(() => undefined);
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

  const addManagedVendor = useCallback((v: ManagedVendor) => {
    setManagedVendors(prev => { const next = [...prev, v]; saveManagedVendors(next); return next; });
  }, []);
  const updateManagedVendor = useCallback((v: ManagedVendor) => {
    setManagedVendors(prev => { const next = prev.map(x => x.id === v.id ? v : x); saveManagedVendors(next); return next; });
  }, []);
  const deleteManagedVendor = useCallback((id: string) => {
    setManagedVendors(prev => { const next = prev.filter(x => x.id !== id); saveManagedVendors(next); return next; });
  }, []);

  const getEventById = useCallback((id: string) => events.find(e => e.id === id), [events]);
  const getEventBySlug = useCallback((slug: string) => events.find(e => e.slug === slug), [events]);
  const getUserReservations = useCallback((phone: string) =>
    reservations.filter(r => r.customer.phone === phone), [reservations]);
  const getEventReservationsByPhone = useCallback((eventId: string, phone: string) =>
    reservations.filter(r => r.eventId === eventId && r.customer.phone === phone), [reservations]);

  return (
    <AppContext.Provider value={{
      events, reservations, companyInfo, managedVendors, isLoading,
      addEvent, updateEvent, deleteEvent,
      addReservation, cancelReservation, deleteReservation, checkIn,
      updateCompanyInfo,
      addManagedVendor, updateManagedVendor, deleteManagedVendor,
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
