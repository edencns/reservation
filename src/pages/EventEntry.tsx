import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar, Info, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

export default function EventEntry() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug } = useApp();
  const event = getEventBySlug(slug ?? '');

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">접근할 수 없는 페이지입니다</h1>
          <p className="text-gray-500 text-sm">유효한 초대 링크를 통해 접속해 주세요.</p>
        </div>
      </div>
    );
  }

  if (event.status === 'closed' || event.status === 'draft') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <p className="text-5xl mb-4">📋</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">예약이 마감되었습니다</h1>
          <p className="text-gray-500 text-sm">{event.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="py-10 px-4 text-center" style={{ backgroundColor: '#91ADC2' }}>
        <p className="text-white/70 text-xs mb-2 uppercase tracking-widest">방문 예약</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{event.title}</h1>
        <p className="text-blue-100 text-sm mt-2">{event.venue}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: '#91ADC2' }} />
            <div>
              <p className="font-semibold text-gray-800">{event.venue}</p>
              <p className="text-gray-500">{event.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={15} style={{ color: '#91ADC2' }} />
            <span>
              {formatDate(event.dates[0])}
              {event.dates.length > 1 && ` ~ ${formatDate(event.dates[event.dates.length - 1])}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={15} style={{ color: '#91ADC2' }} />
            <span>{event.timeSlots[0]?.time} ~ {event.timeSlots[event.timeSlots.length - 1]?.time}</span>
            <span className="text-gray-400">({event.timeSlots.length}개 시간대)</span>
          </div>
        </div>

        {/* 안내 */}
        {event.description && (
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <Info size={15} style={{ color: '#91ADC2' }} /> 안내사항
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate(`/e/${event.slug}/reserve`)}
          className="w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
          style={{ backgroundColor: '#91ADC2' }}
        >
          방문 예약하기 <ChevronRight size={22} />
        </button>

        <button
          onClick={() => navigate(`/e/${event.slug}/ticket`)}
          className="w-full py-3 rounded-2xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all text-sm"
        >
          이미 예약하셨나요? 예약 확인하기
        </button>
      </div>
    </div>
  );
}
