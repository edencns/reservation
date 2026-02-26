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

  const getTimeRange = () => {
    if (event.startTime || event.endTime) {
      const start = event.startTime || '시간 미지정';
      const end = event.endTime || '시간 미지정';
      return `${start} ~ ${end}`;
    }
    const slots = event.timeSlots ?? [];
    if (slots.length === 0) return '시간 미지정';
    const first = slots[0]?.time;
    const last = slots[slots.length - 1]?.time;
    if (!first || !last) return '시간 미지정';
    if (first === '시간 미지정' && last === '시간 미지정') return '시간 미지정';
    return `${first} ~ ${last}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => navigate('/events')}
        className="fixed top-20 left-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-600 md:hidden"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Top banner */}
      <div className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden" style={event.imageUrl ? { backgroundColor: '#000' } : { backgroundColor: '#E0D6F9' }}>
        {event.imageUrl ? (
          <>
            <img src={event.imageUrl} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50 pointer-events-none" />
            <img src={event.imageUrl} alt={event.title} className="relative max-w-full max-h-full object-contain" style={{ maxHeight: '16rem' }} />
          </>
        ) : (
          <span className="text-7xl">🏢</span>
        )}
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
                <span>{getTimeRange()}</span>
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
              <p className="text-sm text-gray-500 mb-5">원하는 날짜를 선택해 예약해주세요.</p>

              <button
                onClick={() => event.status === 'active' && navigate(`/reserve/${event.id}`)}
                disabled={event.status !== 'active'}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ backgroundColor: event.status === 'active' ? '#667EEA' : undefined }}
              >
                {event.status === 'active' ? '방문 예약하기' : '예약 마감'}
              </button>
              {(event.vendorCategories?.length ?? 0) > 0 && (
                <button
                  onClick={() => navigate(`/e/${event.slug}/vendors`)}
                  className="w-full mt-2 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                  style={{ borderColor: '#667EEA', color: '#667EEA' }}
                >
                  입점 업체 확인하기
                </button>
              )}
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
