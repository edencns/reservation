import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';
import { ArrowRight, MapPin, Clock, Building } from 'lucide-react';

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
      <section className="relative min-h-screen flex items-center px-6 md:px-10 overflow-hidden pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto py-20">
          {/* Left */}
          <div className="z-10">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-6"
              style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}
            >
              프리미엄 입주 박람회
            </span>
            <h1
              className="text-5xl lg:text-7xl font-extrabold leading-tight mb-8"
              style={{ color: 'var(--primary)' }}
            >
              새로운 시작을 위한<br />
              <span className="font-light" style={{ color: 'var(--primary-container)' }}>특별한 입주 경험.</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-lg mb-12" style={{ color: 'var(--on-surface-variant)' }}>
              인테리어, 금융, 보안, 이사까지 — 입주에 필요한 모든 것을 한 곳에서.
              전문 업체와의 독점 파트너십으로 최상의 조건을 제공합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/events')}
                className="hero-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:opacity-90 transition-opacity shadow-md"
              >
                박람회 예약하기 <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/my-tickets')}
                className="px-8 py-4 rounded-xl font-bold border transition-colors"
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

          {/* Right – hero image */}
          <div className="relative hidden lg:block">
            <div className="rounded-3xl overflow-hidden shadow-2xl relative" style={{ aspectRatio: '4/5' }}>
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
                  <Building size={80} style={{ color: 'var(--primary-fixed-dim)' }} />
                </div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,53,95,0.35) 0%, transparent 60%)' }} />
            </div>
            {/* Floating info card */}
            {heroEvent && (
              <div
                className="absolute -bottom-8 -left-8 p-6 rounded-2xl shadow-xl max-w-xs"
                style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}
              >
                <p className="font-bold text-sm mb-1" style={{ color: 'var(--on-surface)' }}>{heroEvent.title}</p>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--on-surface-variant)' }}>
                  <MapPin size={12} />
                  <span className="truncate">{heroEvent.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 서비스 혜택 (Bento Grid) ── */}
      <section className="py-24 px-6 md:px-10" style={{ background: 'var(--surface-container-low)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--primary)' }}>입주민 혜택</h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>박람회 참가자만을 위한 독점 서비스를 경험해 보세요.</p>
          </div>

          {/* Bento: 4-col 2-row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:h-[580px]">
            {/* Large card – Interior (col-span-2, row-span-2) */}
            <div
              className="md:col-span-2 md:row-span-2 p-10 rounded-3xl flex flex-col justify-between cursor-pointer transition-all group"
              style={{ background: 'var(--surface-container-lowest)', border: '1px solid transparent' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-fixed-dim)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
              onClick={() => navigate('/events')}
            >
              <div>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
                  style={{ background: 'var(--primary-fixed)' }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--primary)', fontFamily: 'Material Symbols Outlined' }}>home_max</span>
                </div>
                <h3 className="text-3xl font-extrabold mb-6" style={{ color: 'var(--primary)' }}>인테리어<br />코디네이션</h3>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
                  프리미엄 마감재와 최고의 디자이너를 박람회 특가로 만나보세요. 입주민 전용 특별 할인 혜택을 제공합니다.
                </p>
              </div>
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--primary)' }}>
                자세히 보기 <ArrowRight size={16} />
              </div>
            </div>

            {/* Financial – dark (col-span-2) */}
            <div
              className="md:col-span-2 p-8 rounded-3xl flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'var(--primary-container)' }}
              onClick={() => navigate('/events')}
            >
              <div className="max-w-xs">
                <h3 className="text-2xl font-extrabold mb-3 text-white">금융 컨설팅</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  신규 분양 입주를 위한 전략적 모기지 및 보험 설계. 최적의 금융 플랜을 제안해 드립니다.
                </p>
              </div>
              <span className="material-symbols-outlined opacity-30 text-white" style={{ fontSize: '4rem', fontFamily: 'Material Symbols Outlined' }}>account_balance</span>
            </div>

            {/* Security */}
            <div
              className="p-8 rounded-3xl flex flex-col justify-end cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'var(--surface-container-high)' }}
              onClick={() => navigate('/events')}
            >
              <span className="material-symbols-outlined text-4xl mb-4" style={{ color: 'var(--primary)', fontFamily: 'Material Symbols Outlined' }}>security</span>
              <h4 className="font-extrabold mb-1" style={{ color: 'var(--primary)' }}>스마트 보안</h4>
              <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>스마트홈 통합 솔루션 구성.</p>
            </div>

            {/* Moving */}
            <div
              className="p-8 rounded-3xl flex flex-col justify-end cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'var(--surface-container-high)' }}
              onClick={() => navigate('/events')}
            >
              <span className="material-symbols-outlined text-4xl mb-4" style={{ color: 'var(--primary)', fontFamily: 'Material Symbols Outlined' }}>local_shipping</span>
              <h4 className="font-extrabold mb-1" style={{ color: 'var(--primary)' }}>이사 서비스</h4>
              <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>전문 업체 원스톱 연계 서비스.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 진행 중인 박람회 ── */}
      <section className="py-24 px-6 md:px-10" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-12" style={{ color: 'var(--primary)' }}>진행 중인 박람회</h2>

          {activeEvents.length === 0 ? (
            <div className="text-center py-20 rounded-3xl" style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}>
              <p className="text-4xl mb-3">🏢</p>
              <p className="font-medium">현재 진행 중인 박람회가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeEvents.map((event) => {
                const startDate = event.dates[0] ? formatDate(event.dates[0]) : '';
                const endDate = event.dates.length > 1 ? formatDate(event.dates[event.dates.length - 1]) : '';
                const timeRange = getTimeRange(event);
                const dateObj = event.dates[0] ? new Date(event.dates[0]) : null;
                const month = dateObj
                  ? dateObj.toLocaleDateString('ko-KR', { month: 'short' }).replace('월', 'M')
                  : '';
                const day = dateObj ? dateObj.getDate() : '';

                return (
                  <div
                    key={event.id}
                    className="p-6 rounded-2xl flex items-center gap-8 cursor-pointer transition-colors group"
                    style={{ background: 'var(--surface-container-lowest)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-container-lowest)')}
                    onClick={() => navigate(`/e/${event.slug}`)}
                  >
                    {/* Date block */}
                    {dateObj && (
                      <div className="text-center min-w-[72px] hidden sm:block flex-shrink-0">
                        <span className="block text-xl font-extrabold" style={{ color: 'var(--primary)' }}>{month}</span>
                        <span className="block text-4xl font-extrabold leading-none" style={{ color: 'var(--outline)' }}>{day}</span>
                      </div>
                    )}

                    {/* Thumbnail */}
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 hidden sm:block"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-lg truncate mb-1" style={{ color: 'var(--on-surface)' }}>
                        {event.title}
                      </h4>
                      <p className="text-sm flex items-center gap-1.5 mb-0.5" style={{ color: 'var(--on-surface-variant)' }}>
                        <MapPin size={13} />{event.address}
                      </p>
                      {timeRange && (
                        <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
                          <Clock size={13} />{timeRange}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: 'var(--outline)' }}>
                        {startDate}{endDate && ` ~ ${endDate}`}
                      </p>
                    </div>

                    <ArrowRight size={20} className="flex-shrink-0 transition-colors" style={{ color: 'var(--outline-variant)' }} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={() => navigate('/events')}
              className="px-8 py-3.5 rounded-xl font-bold border-2 transition-colors"
              style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-fixed)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              전체 박람회 보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
