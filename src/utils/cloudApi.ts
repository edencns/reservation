import type { Event, Reservation, TemplateField } from '../types';

const jsonHeaders = { 'Content-Type': 'application/json' };

// ── 인증 API ──────────────────────────────────────────────────────────────────

export const apiMe = async (): Promise<{ id: string; loginId: string; role: string; vendorId?: string } | null> => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json() as { user: { id: string; loginId: string; role: string; vendorId?: string } | null };
    return data.user;
  } catch {
    return null;
  }
};

export const apiChangePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  await parseJson<{ ok: true }>(res);
};

// ── 업체 관리 API ─────────────────────────────────────────────────────────────

export const apiGetVendorsFromDB = async () => {
  const res = await fetch('/api/vendors', { credentials: 'include' });
  return parseJson<unknown[]>(res);
};

export const apiSetKioskPin = async (slug: string, pin: string): Promise<void> => {
  const res = await fetch(`/api/kiosk/${encodeURIComponent(slug)}/set-pin`, {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'include',
    body: JSON.stringify({ pin }),
  });
  await parseJson<{ ok: true }>(res);
};

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

export const apiDeleteReservation = async (id: string): Promise<void> => {
  const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
  await parseJson<{ ok: true }>(res);
};

export const apiSendSmsAuto = async (
  reservationId: string,
  template: 'confirm' | 'cancel',
): Promise<void> => {
  const res = await fetch('/api/sms/auto', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ reservationId, template }),
  });
  // 실패해도 예약 흐름에 영향 없도록 무시
  await parseJson<{ ok: true }>(res).catch(() => undefined);
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

export interface ContractSmsPayload {
  to: string;
  customerName: string;
  vendorName: string;
  vendorCategory: string;
  eventTitle: string;
  unitNumber: string;
  totalAmount: number;
  depositAmount: number;
}

export const apiSendContractSms = async (data: ContractSmsPayload): Promise<{ ok: boolean }> => {
  const res = await fetch('/api/sms/contract', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(data),
  });
  return parseJson<{ ok: boolean }>(res);
};

const resizeImageForAI = (dataUrl: string, maxWidth = 1200): Promise<string> =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= maxWidth) { resolve(dataUrl); return; }
      const scale = maxWidth / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = dataUrl;
  });

export const apiAnalyzeContractTemplate = async (
  imageBase64: string
): Promise<{ fields: TemplateField[]; rawText: string }> => {
  const resized = await resizeImageForAI(imageBase64);
  const res = await fetch('/api/contract/analyze', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ image: resized }),
  });
  const data = await parseJson<{
    fields: Omit<TemplateField, 'id' | 'value'>[];
    rawText?: string;
    error?: string;
  }>(res);
  return {
    fields: (data.fields ?? []).map((f, i) => ({
      id: `field_${Date.now()}_${i}`,
      label: f.label,
      type: f.type,
      value: '',
    })),
    rawText: data.rawText ?? '',
  };
};

export const apiExtractContractFields = async (
  rawText: string,
): Promise<{ fields: Omit<TemplateField, 'id' | 'value'>[]; method: 'llm' | 'regex' | 'none' }> => {
  const res = await fetch('/api/contract/extract-fields', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ rawText }),
  });
  return parseJson<{ fields: Omit<TemplateField, 'id' | 'value'>[]; method: 'llm' | 'regex' | 'none' }>(res);
};

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
