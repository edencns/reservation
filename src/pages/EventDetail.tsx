import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, ChevronLeft, Calendar, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, categoryLabel, formatCurrency } from '../utils/helpers';

const categoryImages: Record<string, string> = {
  concert: '🎵', exhibition: '🎨', sports: '⚽',
  performance: '🎭', conference: '💼', other: '🎪',
};

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
          <p className="text-xl font-bold text-gray-700">이벤트를 찾을 수 없습니다</p>
          <button onClick={() => navigate('/events')} className="mt-4 text-[#91ADC2] underline">
            이벤트 목록으로
          </button>
        </div>
      </div>
    );
  }

  const minPrice = Math.min(...event.pricing.map(p => p.price));
  const maxPrice = Math.max(...event.pricing.map(p => p.price));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <button
        onClick={() => navigate('/events')}
        className="fixed top-20 left-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-gray-800 transition-all md:hidden"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Hero image */}
      <div
        className="h-56 md:h-72 flex items-center justify-center text-8xl md:text-9xl"
        style={{ backgroundColor: '#FFDAB9' }}
      >
        {categoryImages[event.category] ?? '🎪'}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <span className="text-xs font-semibold text-white px-3 py-1 rounded-full"
                style={{ backgroundColor: '#91ADC2' }}>
                {categoryLabel[event.category]}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mt-3">{event.title}</h1>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#91ADC2]" />
                <div>
                  <p className="font-medium text-gray-800">{event.venue}</p>
                  <p className="text-gray-500">{event.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="shrink-0 text-[#91ADC2]" />
                <span>
                  {formatDate(event.dates[0])}
                  {event.dates.length > 1 && ` ~ ${formatDate(event.dates[event.dates.length - 1])}`}
                </span>
              </div>
              {event.runningTime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-[#91ADC2]" />
                  <span>러닝타임: {event.runningTime}</span>
                </div>
              )}
              {event.ageLimit && (
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-[#91ADC2]" />
                  <span>관람 연령: {event.ageLimit}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users size={16} className="shrink-0 text-[#91ADC2]" />
                <span>회차당 최대 {event.maxCapacity > 0 ? event.maxCapacity : event.rows * event.seatsPerRow}명</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-3">공연 소개</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Time slots */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-3">공연 시간</h2>
              <div className="flex flex-wrap gap-2">
                {event.timeSlots.map(ts => (
                  <span key={ts.id} className="px-3 py-1.5 rounded-lg text-sm font-medium border"
                    style={{ borderColor: '#91ADC2', color: '#91ADC2', backgroundColor: '#91ADC211' }}>
                    {ts.time}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-5 sticky top-20">
              <h2 className="font-bold text-gray-800 mb-4">티켓 예매</h2>

              {/* Pricing */}
              <div className="space-y-2 mb-5">
                {event.pricing.map(p => (
                  <div key={p.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-gray-600">{p.category}</span>
                    </div>
                    <span className="font-bold text-gray-800">{formatCurrency(p.price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">가격 범위</span>
                  <span className="font-bold" style={{ color: '#91ADC2' }}>
                    {minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} ~ ${formatCurrency(maxPrice)}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => event.status === 'active' && navigate(`/reserve/${event.id}`)}
                disabled={event.status !== 'active'}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{ backgroundColor: event.status === 'active' ? '#91ADC2' : undefined }}
              >
                {event.status === 'active' ? '예약하기' : '예약 마감'}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                예약 후 마이페이지에서 QR 티켓을 확인하세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
