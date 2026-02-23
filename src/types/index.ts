export type ReservationStatus = 'confirmed' | 'cancelled';
export type CustomFieldType = 'text' | 'tel' | 'number' | 'email' | 'select';

export interface CustomField {
  id: string;
  key: string;         // 저장 키 (영문, 예: 'unitNumber')
  label: string;       // 표시 레이블 (예: '동호수')
  type: CustomFieldType;
  placeholder?: string;
  options?: string[];  // type='select'일 때 선택지
  required: boolean;
}

export interface TimeSlotDef {
  id: string;
  time: string;
}

export interface Event {
  id: string;
  slug: string;                  // 고유 URL 슬러그 (예: 'abc123de')
  title: string;
  description: string;
  venue: string;
  address: string;
  dates: string[];
  timeSlots: TimeSlotDef[];
  customFields: CustomField[];   // 행사별 커스텀 수집 필드
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Reservation {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  timeSlotId: string;
  attendeeCount: number;
  customer: Customer;
  extraFields: Record<string, string>;  // 커스텀 필드 값 (key → value)
  status: ReservationStatus;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}
