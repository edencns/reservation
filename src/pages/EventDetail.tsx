import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronLeft, Calendar, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEventById } = useApp();
  const event = getEventById(id ?? '');

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😢</p>
          <p className="text-xl font-bold text-gray-700">행사를 찾을 수 없습니다</p>
          <button onClick={() => navigate('/events')} className="mt-4 text-[#667EEA] underline">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => navigate('/events')}
        className="fixed top-20 left-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-600 md:hidden"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Top banner */}
      <div className="h-32 md:h-44 flex items-center justify-center text-7xl" style={{ backgroundColor: '#E0D6F9' }}>
        🏢
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="md:col-span-2 space-y-5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">{event.title}</h1>

            <div className="space-y-2.5 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: '#667EEA' }} />
                <div>
                  <p className="font-semibold text-gray-800">{event.venue}</p>
                  <p className="text-gray-500">{event.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: '#667EEA' }} />
                <span>
                  {formatDate(event.dates[0])}
                  {event.dates.length > 1 && ` ~ ${formatDate(event.dates[event.dates.length - 1])}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: '#667EEA' }} />
                <span>
                  {event.timeSlots[0]?.time} ~ {event.timeSlots[event.timeSlots.length - 1]?.time}
                </span>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Info size={16} style={{ color: '#667EEA' }} /> 행사 안내
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

          </div>

          {/* Booking card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-5 sticky top-20">
              <h2 className="font-bold text-gray-800 mb-2">방문 예약</h2>
              <p className="text-sm text-gray-500 mb-5">원하는 날짜와 시간을 선택해 예약하세요</p>

              <button
                onClick={() => event.status === 'active' && navigate(`/reserve/${event.id}`)}
                disabled={event.status !== 'active'}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ backgroundColor: event.status === 'active' ? '#667EEA' : undefined }}
              >
                {event.status === 'active' ? '방문 예약하기' : '예약 마감'}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3">
                예약 후 QR 티켓을 저장해 방문 시 제시하세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
