import type { Event, Reservation } from '../types';

const jsonHeaders = { 'Content-Type': 'application/json' };

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const apiGetEvents = async (): Promise<Event[]> => {
  const res = await fetch('/api/events');
  return parseJson<Event[]>(res);
};

export const apiCreateEvent = async (event: Event): Promise<void> => {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(event),
  });
  await parseJson<{ ok: true }>(res);
};

export const apiUpdateEvent = async (event: Event): Promise<void> => {
  const res = await fetch(`/api/events/${event.id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(event),
  });
  await parseJson<{ ok: true }>(res);
};

export const apiDeleteEvent = async (id: string): Promise<void> => {
  const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
  await parseJson<{ ok: true }>(res);
};

export const apiGetReservations = async (): Promise<Reservation[]> => {
  const res = await fetch('/api/reservations');
  return parseJson<Reservation[]>(res);
};

export const apiCreateReservation = async (reservation: Reservation): Promise<void> => {
  const res = await fetch('/api/reservations', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(reservation),
  });
  await parseJson<{ ok: true }>(res);
};

export const apiCancelReservation = async (id: string): Promise<void> => {
  const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
  await parseJson<{ ok: true }>(res);
};

export const apiCheckInReservation = async (id: string, checkedInAt: string): Promise<void> => {
  const res = await fetch(`/api/reservations/${id}/checkin`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify({ checkedInAt }),
  });
  await parseJson<{ ok: true }>(res);
};

export interface SmsSendResult {
  ok: boolean;
  sent: number;
  failed: number;
  total: number;
}

export const apiSendSms = async (
  reservationIds: string[],
  template: 'confirm' | 'reminder',
  daysLeft?: number,
): Promise<SmsSendResult> => {
  const res = await fetch('/api/sms/send', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ reservationIds, template, daysLeft }),
  });
  return parseJson<SmsSendResult>(res);
};
