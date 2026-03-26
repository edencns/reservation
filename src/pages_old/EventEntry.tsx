import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar, Info, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

export default function EventEntry() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, isLoading } = useApp();
  const event = getEventBySlug(slug ?? '');

  if (isLoading && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-outline">행사 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center px-4">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-on-surface mb-2">접근할 수 없는 페이지입니다</h1>
          <p className="text-on-surface-variant text-sm">유효한 초대 링크를 통해 접속해 주세요.</p>
        </div>
      </div>
    );
  }

  if (event.status === 'closed' || event.status === 'draft') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center px-4">
          <p className="text-5xl mb-4">📋</p>
          <h1 className="text-xl font-bold text-on-surface mb-2">예약이 마감되었습니다</h1>
          <p className="text-on-surface-variant text-sm">{event.title}</p>
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
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="py-12 px-4 text-center bg-gradient-to-r from-primary to-primary-container">
        <p className="text-white/70 text-xs mb-2 uppercase tracking-widest">방문 예약</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{event.title}</h1>
        <p className="text-primary-fixed-dim text-sm mt-2">{event.venue}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* 기본 정보 */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex items-start gap-2 text-sm text-on-surface-variant">
            <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-on-surface">{event.venue}</p>
              <p className="text-on-surface-variant">{event.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Calendar size={15} className="text-primary" />
            <span>
              {formatDate(event.dates[0])}
              {event.dates.length > 1 && ` ~ ${formatDate(event.dates[event.dates.length - 1])}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Clock size={15} className="text-primary" />
            <span>{getTimeRange()}</span>
          </div>
        </div>

        {/* 안내 */}
        {event.description && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5">
            <h2 className="font-bold text-on-surface mb-3 flex items-center gap-2 text-sm">
              <Info size={15} className="text-primary" /> 안내사항
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* CTA */}
        <div className="relative">
          {(event.vendorCategories?.length ?? 0) > 0 && (
            <button
              onClick={() => navigate(`/e/${event.slug}/vendors`)}
              className="absolute -top-6 right-0 text-xs font-medium text-primary hover:underline"
            >
              입점 업체 확인하기 →
            </button>
          )}
          <button
            onClick={() => navigate(`/e/${event.slug}/reserve`)}
            className="w-full py-4 rounded-2xl font-bold bg-primary text-on-primary text-lg flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
          >
            방문 예약하기 <ChevronRight size={22} />
          </button>
        </div>

        <button
          onClick={() => navigate(`/e/${event.slug}/ticket`)}
          className="w-full py-3 rounded-2xl font-medium text-on-surface bg-surface-container-lowest border border-outline-variant hover:bg-surface-container transition-all text-sm"
        >
          이미 예약하셨나요? 예약 확인하기
        </button>
      </div>
    </div>
  );
}
