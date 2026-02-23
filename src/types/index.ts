export type EventCategory = 'concert' | 'exhibition' | 'sports' | 'performance' | 'conference' | 'other';
export type PaymentMethod = 'card' | 'bank' | 'phone';
export type ReservationStatus = 'confirmed' | 'cancelled';

export interface PriceCategory {
  category: string;
  price: number;
  color: string;
  rows?: string[]; // for numbered seats
}

export interface TimeSlotDef {
  id: string;
  time: string;
  maxCapacity: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  category: EventCategory;
  dates: string[];
  timeSlots: TimeSlotDef[];
  seatType: 'numbered' | 'unnumbered';
  rows: number;
  seatsPerRow: number;
  maxCapacity: number;
  pricing: PriceCategory[];
  image?: string;
  runningTime?: string;
  ageLimit?: string;
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
  seatNumbers: string[];
  attendeeCount: number;
  customer: Customer;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: string;
}

export interface SeatAvailability {
  eventId: string;
  date: string;
  time: string;
  reservedSeats: string[];
}
