import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';
import {
  ArrowRight, MapPin, Clock, Building,
  PaintbrushVertical, Banknote, ShieldCheck, Truck,
} from 'lucide-react';

const services = [
  {
    icon: <PaintbrushVertical size={28} />,
    title: '인테리어 코디네이션',
    description: '프리미엄 마감재와 최고의 디자이너를 박람회 특가로 만나보세요. 입주민 전용 특별 할인 혜택을 제공합니다.',
    featured: true,
  },
  {
    icon: <Banknote size={28} />,
    title: '금융 컨설팅',
    description: '신규 분양 입주를 위한 전략적 모기지 및 보험 설계. 최적의 금융 플랜을 제안해 드립니다.',
    featured: false,
  },
  {
    icon: <ShieldCheck size={28} />,
    title: '스마트 보안',
    description: '스마트홈 통합 솔루션으로 안전하고 편리한 생활 환경을 구성하세요.',
    featured: false,
  },
  {
    icon: <Truck size={28} />,
    title: '이사 서비스',
    description: '전문 이사 업체와 연계한 원스톱 이삿짐 운반 서비스를 제공합니다.',
    featured: false,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { events } = useApp();

  const activeEvents = events.filter(e => e.status === 'active');
  const heroEvent = activeEvents[0];

  const getTimeRange = (event: (typeof events)[0]) => {
    if (event.startTime || event.endTime) {
      return `${event.startTime ?? ''} ~ ${event.endTime ?? ''}`.trim();
    }
    const slots = event.timeSlots ?? [];
    if (slots.length === 0) return '';
    const first = slots[0]?.time;
    const last = slots[slots.length - 1]?.time;
    if (!first || first === '시간 미지정') return '';
    return first === last ? first : `${first} ~ ${last}`;
  };

  return (
    <div style={{ background: 'var(--surface)', color: 'var(--on-surface)' }}>

      {/* ── Hero ── */}
      <section className="px-6 md:px-10 pt-20">
        <div className="max-w-7xl mx-auto py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-6"
              style={{ background: 'var(--secondary-container)', color: 'var(--primary)' }}
            >
              프리미엄 입주 박람회
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
              style={{ color: 'var(--primary)' }}
            >
              새로운 시작을 위한<br />
              <span className="font-light" style={{ color: 'var(--primary-container)' }}>
                특별한 입주 경험.
              </span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed mb-10 max-w-md" style={{ color: 'var(--on-surface-variant)' }}>
              인테리어, 금융, 보안, 이사까지 — 입주에 필요한 모든 것을 한 곳에서.
              전문 업체와의 독점 파트너십으로 최상의 조건을 제공합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/events')}
                className="hero-gradient text-white px-7 py-3.5 rounded-xl font-bold flex items-center gap-2.5 hover:opacity-90 transition-opacity shadow-md"
              >
                박람회 예약하기 <ArrowRight size={17} />
              </button>
              <button
                onClick={() => navigate('/my-tickets')}
                className="px-7 py-3.5 rounded-xl font-semibold border transition-colors hover:opacity-80"
                style={{
                  background: 'var(--surface-container-lowest)',
                  color: 'var(--primary)',
                  borderColor: 'var(--outline-variant)',
                }}
              >
                내 예약 확인
              </button>
            </div>
          </div>

          {/* Right – event image card */}
          <div className="relative hidden lg:block">
            <div className="rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
              {heroEvent?.imageUrl ? (
                <img
                  src={heroEvent.imageUrl}
                  alt={heroEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--primary-fixed) 0%, var(--secondary-container) 100%)' }}
                >
                  <Building size={72} style={{ color: 'var(--primary-fixed-dim)' }} />
                </div>
              )}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,53,95,0.45) 0%, transparent 55%)' }}
              />
              {heroEvent && (
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-bold text-white text-sm truncate">{heroEvent.title}</p>
                  <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    <MapPin size={11} />{heroEvent.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 서비스 혜택 ── */}
      <section className="py-20 px-6 md:px-10" style={{ background: 'var(--surface-container-low)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--primary)' }}>입주민 혜택</h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>박람회 참가자만을 위한 독점 서비스를 경험해 보세요.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl p-7 flex flex-col cursor-pointer transition-all hover:shadow-lg"
                style={s.featured
                  ? { background: 'var(--primary)', color: '#fff' }
                  : { background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }
                }
                onClick={() => navigate('/events')}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                  style={s.featured
                    ? { background: 'rgba(255,255,255,0.15)' }
                    : { background: 'var(--primary-fixed)' }
                  }
                >
                  <span style={{ color: s.featured ? '#fff' : 'var(--primary)' }}>{s.icon}</span>
                </div>
                <h3
                  className="font-extrabold text-lg mb-2"
                  style={{ color: s.featured ? '#fff' : 'var(--primary)' }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm leading-relaxed flex-grow"
                  style={{ color: s.featured ? 'rgba(255,255,255,0.75)' : 'var(--on-surface-variant)' }}
                >
                  {s.description}
                </p>
                <div
                  className="flex items-center gap-1.5 mt-5 text-sm font-bold"
                  style={{ color: s.featured ? '#fff' : 'var(--primary)' }}
                >
                  자세히 보기 <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 진행 중인 박람회 ── */}
      <section className="py-20 px-6 md:px-10" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold" style={{ color: 'var(--primary)' }}>진행 중인 박람회</h2>
              <p className="mt-1" style={{ color: 'var(--on-surface-variant)' }}>현재 예약 가능한 박람회 일정입니다.</p>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="hidden sm:flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              전체 보기 <ArrowRight size={15} />
            </button>
          </div>

          {activeEvents.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}
            >
              <p className="text-4xl mb-3">🏢</p>
              <p className="font-medium">현재 진행 중인 박람회가 없습니다</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeEvents.map((event) => {
                const startDate = event.dates[0] ? formatDate(event.dates[0]) : '';
                const endDate = event.dates.length > 1 ? formatDate(event.dates[event.dates.length - 1]) : '';
                const timeRange = getTimeRange(event);
                const dateObj = event.dates[0] ? new Date(event.dates[0]) : null;
                const month = dateObj
                  ? (dateObj.getMonth() + 1) + '월'
                  : '';
                const day = dateObj ? dateObj.getDate() : '';

                return (
                  <div
                    key={event.id}
                    className="rounded-2xl p-5 flex items-center gap-5 cursor-pointer transition-all group border"
                    style={{
                      background: 'var(--surface-container-lowest)',
                      borderColor: 'var(--outline-variant)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--primary-fixed)';
                      e.currentTarget.style.borderColor = 'var(--primary-fixed-dim)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--surface-container-lowest)';
                      e.currentTarget.style.borderColor = 'var(--outline-variant)';
                    }}
                    onClick={() => navigate(`/e/${event.slug}`)}
                  >
                    {/* Date block */}
                    {dateObj && (
                      <div
                        className="text-center w-16 flex-shrink-0 hidden sm:block py-2 px-1 rounded-xl"
                        style={{ background: 'var(--primary-fixed)', minWidth: '3.5rem' }}
                      >
                        <span className="block text-xs font-bold" style={{ color: 'var(--primary-container)' }}>{month}</span>
                        <span className="block text-3xl font-extrabold leading-tight" style={{ color: 'var(--primary)' }}>{day}</span>
                      </div>
                    )}

                    {/* Thumbnail */}
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-20 h-16 rounded-xl object-cover flex-shrink-0 hidden md:block"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-base md:text-lg truncate" style={{ color: 'var(--on-surface)' }}>
                        {event.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <span className="text-sm flex items-center gap-1" style={{ color: 'var(--on-surface-variant)' }}>
                          <MapPin size={12} />{event.address}
                        </span>
                        {timeRange && (
                          <span className="text-sm flex items-center gap-1" style={{ color: 'var(--on-surface-variant)' }}>
                            <Clock size={12} />{timeRange}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--outline)' }}>
                        {startDate}{endDate && ` ~ ${endDate}`}
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-2 text-sm font-bold flex-shrink-0 transition-colors"
                      style={{ color: 'var(--primary)' }}
                    >
                      <span className="hidden sm:inline">예약하기</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <button
              onClick={() => navigate('/events')}
              className="px-8 py-3 rounded-xl font-bold border-2"
              style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              전체 박람회 보기
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 md:px-10 py-16">
        <div
          className="max-w-7xl mx-auto rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 hero-gradient"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              지금 바로 입주 박람회를 예약하세요
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)' }}>
              한정된 좌석이 빠르게 마감되고 있습니다. 놓치지 마세요.
            </p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="flex-shrink-0 flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
            style={{ background: '#fff', color: 'var(--primary)' }}
          >
            박람회 목록 보기 <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
