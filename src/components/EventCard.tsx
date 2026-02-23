import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import type { Event } from '../types';
import { formatDate, categoryLabel, formatCurrency } from '../utils/helpers';

const categoryColors: Record<string, string> = {
  concert: 'bg-purple-100 text-purple-700',
  exhibition: 'bg-green-100 text-green-700',
  sports: 'bg-orange-100 text-orange-700',
  performance: 'bg-pink-100 text-pink-700',
  conference: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-700',
};

const categoryImages: Record<string, string> = {
  concert: '🎵',
  exhibition: '🎨',
  sports: '⚽',
  performance: '🎭',
  conference: '💼',
  other: '🎪',
};

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const navigate = useNavigate();
  const minPrice = Math.min(...event.pricing.map(p => p.price));
  const maxPrice = Math.max(...event.pricing.map(p => p.price));

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Image area */}
      <div
        className="h-40 flex items-center justify-center text-6xl"
        style={{ backgroundColor: '#FFDAB9' }}
      >
        {categoryImages[event.category] ?? '🎪'}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[event.category]}`}>
            {categoryLabel[event.category]}
          </span>
          {event.status === 'closed' && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">마감</span>
          )}
        </div>

        <h3 className="font-bold text-gray-800 text-base mt-2 mb-3 line-clamp-2">{event.title}</h3>

        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>{formatDate(event.dates[0])}</span>
            {event.dates.length > 1 && <span className="text-xs text-gray-400">외 {event.dates.length - 1}일</span>}
          </div>
          {event.runningTime && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>{event.runningTime}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: '#91ADC2' }}>
            {minPrice === maxPrice
              ? formatCurrency(minPrice)
              : `${formatCurrency(minPrice)} ~`}
          </span>
          <button
            className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: event.status === 'active' ? '#91ADC2' : '#ccc' }}
            disabled={event.status !== 'active'}
          >
            {event.status === 'active' ? '예약하기' : '마감'}
          </button>
        </div>
      </div>
    </div>
  );
}
