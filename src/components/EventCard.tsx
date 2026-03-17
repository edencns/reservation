import { useNavigate } from 'react-router-dom';
import type { Event } from '../types';
import { formatDate } from '../utils/helpers';

interface EventCardProps {
  event: Event;
  plain?: boolean;
}

export function EventCard({ event, plain }: EventCardProps) {
  const navigate = useNavigate();

  const startDate = event.dates[0] ? formatDate(event.dates[0]) : '';
  const endDate = event.dates.length > 1 ? formatDate(event.dates[event.dates.length - 1]) : '';

  const content = (
    <>
      <div className={`aspect-video mb-4 overflow-hidden rounded-xl ${plain ? 'mx-8' : ''}`}>
        <img
          src={event.imageUrl || 'https://via.placeholder.com/400x225?text=Event+Image'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="font-bold text-lg mb-1 truncate text-gray-900">{event.title}</p>
      <p className="text-sm text-gray-500 mb-1">장소: {event.address}</p>
      <p className="text-sm text-gray-500 mb-5">일시: {startDate} ~ {endDate}</p>
      <button
        onClick={() => navigate(`/e/${event.slug}`)}
        className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
        style={{ background: '#3B82F6' }}
      >
        예약하기
      </button>
    </>
  );

  if (plain) return content;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {content}
    </div>
  );
}
