import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import type { Event } from '../types';
import { formatDate } from '../utils/helpers';

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Top accent */}
      <div className="h-2 w-full" style={{ backgroundColor: '#91ADC2' }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-base leading-tight flex-1 pr-2">{event.title}</h3>
          {event.status !== 'active' && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">마감</span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-start gap-1.5">
            <MapPin size={14} className="shrink-0 mt-0.5" style={{ color: '#91ADC2' }} />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} style={{ color: '#91ADC2' }} />
            <span>{formatDate(event.dates[0])}</span>
            {event.dates.length > 1 && (
              <span className="text-xs text-gray-400">외 {event.dates.length - 1}일</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} style={{ color: '#91ADC2' }} />
            <span>
              {event.timeSlots[0]?.time} ~ {event.timeSlots[event.timeSlots.length - 1]?.time}
            </span>
            <span className="text-xs text-gray-400">({event.timeSlots.length}회차)</span>
          </div>
        </div>

        <button
          className="w-full py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          style={{ backgroundColor: event.status === 'active' ? '#91ADC2' : undefined }}
          disabled={event.status !== 'active'}
        >
          {event.status === 'active' ? '방문 예약하기' : '예약 마감'}
        </button>
      </div>
    </div>
  );
}
