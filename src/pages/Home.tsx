import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';
import { ArrowRight, MapPin, Clock, Building, ShieldCheck, Truck } from 'lucide-react';

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
    <div style={{ background: '#f3f5f8', color: '#0d2754' }}>

      {/* ── Hero ── */}
      <section className="mx-auto w-full max-w-[1280px] gap-12 px-6 py-10 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-16">

        {/* Left */}
        <div className="flex flex-col justify-center pt-4 lg:pt-10">
          <div
            className="mb-7 inline-flex w-fit rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ background: '#dbe5f7', color: '#6177a3' }}
          >
            프리미엄 입주 박람회
          </div>

          <h1
            className="max-w-[520px] font-light leading-[0.96]"
            style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', letterSpacing: '-0.05em', color: '#0e2b62' }}
          >
            새로운 시작을 위한<br />특별한 입주 경험.
          </h1>

          <p className="mt-7 max-w-[480px] text-[17px] leading-8" style={{ color: '#66748b' }}>
            인테리어, 금융, 보안, 이사까지 — 입주에 필요한 모든 것을 한 곳에서.
            전문 업체와의 독점 파트너십으로 최상의 조건을 제공합니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/events')}
              className="inline-flex items-center gap-3 rounded-xl px-7 py-4 text-sm font-medium text-white shadow-md transition hover:opacity-90"
              style={{ background: '#0a4b8e' }}
            >
              박람회 예약하기 <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/my-tickets')}
              className="rounded-xl border px-7 py-4 text-sm font-medium shadow-sm transition hover:bg-[#f8fafc]"
              style={{ background: '#fff', color: '#1c345c', borderColor: '#e5eaf2' }}
            >
              내 예약 확인
            </button>
          </div>
        </div>

        {/* Right – image */}
        <div className="relative mt-12 min-h-[440px] lg:mt-0">
          <div
            className="absolute right-0 top-0 h-[420px] w-full overflow-hidden"
            style={{
              maxWidth: '560px',
              borderRadius: '36px',
              background: '#d9dde3',
              boxShadow: '0 25px 60px rgba(18,35,64,0.12)',
            }}
          >
            {heroEvent?.imageUrl ? (
              <img
                src={heroEvent.imageUrl}
                alt={heroEvent.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ background: '#d9dde3' }}>
                <Building size={72} style={{ color: '#8fa8c8' }} />
              </div>
            )}
          </div>

          {/* Floating info card */}
          {heroEvent && (
            <div
              className="absolute bottom-8 left-0 w-full px-6 py-5"
              style={{
                maxWidth: '340px',
                borderRadius: '24px',
                background: '#fff',
                boxShadow: '0 20px 50px rgba(18,35,64,0.14)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: '#eaf1fb', color: '#0a4b8e' }}
                >
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate" style={{ color: '#172e57' }}>
                    {heroEvent.title}
                  </div>
                  <p className="mt-1 text-sm leading-6 truncate" style={{ color: '#6e7a8e' }}>
                    {heroEvent.address}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 입주민 혜택 ── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-12 lg:px-10 lg:py-20">
        <h2
          className="font-light"
          style={{ fontSize: '38px', letterSpacing: '-0.05em', color: '#12305f' }}
        >
          입주민 혜택
        </h2>
        <p className="mt-3 text-[16px]" style={{ color: '#718096' }}>
          박람회 참가자만을 위한 독점 서비스를 경험해 보세요.
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1fr]">
          {/* Large card – Interior */}
          <div
            className="rounded-[30px] bg-white p-8 flex flex-col"
            style={{ boxShadow: '0 16px 40px rgba(18,35,64,0.08)' }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: '#dceafe', color: '#0a4b8e' }}
            >
              <Building size={22} />
            </div>
            <h3
              className="mt-10 max-w-[320px] font-light leading-tight"
              style={{ fontSize: '32px', letterSpacing: '-0.05em', color: '#12305f' }}
            >
              인테리어<br />코디네이션
            </h3>
            <p className="mt-6 max-w-[380px] text-[16px] leading-8 flex-grow" style={{ color: '#6e7b90' }}>
              프리미엄 마감재와 최고의 디자이너를 박람회 특가로 만나보세요.
              입주민 전용 특별 할인 혜택을 제공합니다.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="mt-12 inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
              style={{ color: '#12305f' }}
            >
              자세히 보기 <ArrowRight size={14} />
            </button>
          </div>

          {/* Right grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Financial – dark (col-span-2) */}
            <div
              className="sm:col-span-2 rounded-[30px] p-8 text-white flex flex-col justify-between"
              style={{ background: '#0b4a8a', boxShadow: '0 16px 40px rgba(18,35,64,0.12)', minHeight: '200px' }}
            >
              <div>
                <h3
                  className="font-light leading-tight"
                  style={{ fontSize: '30px', letterSpacing: '-0.05em' }}
                >
                  금융 컨설팅
                </h3>
                <p className="mt-4 max-w-[320px] text-[15px] leading-7" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  신규 분양 입주를 위한 전략적 모기지 및 보험 설계. 최적의 금융 플랜을 제안해 드립니다.
                </p>
              </div>
              <div className="self-end opacity-30 text-white">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
              </div>
            </div>

            {/* Security */}
            <div
              className="rounded-[24px] bg-white p-7 flex flex-col"
              style={{ boxShadow: '0 16px 40px rgba(18,35,64,0.08)' }}
            >
              <ShieldCheck size={28} style={{ color: '#0a4b8e' }} />
              <h4 className="mt-10 text-lg font-medium" style={{ color: '#17315d' }}>스마트 보안</h4>
              <p className="mt-2 text-sm leading-6" style={{ color: '#7a879a' }}>
                스마트홈 통합 솔루션으로 안전한 생활환경을 구성하세요.
              </p>
            </div>

            {/* Moving */}
            <div
              className="rounded-[24px] bg-white p-7 flex flex-col"
              style={{ boxShadow: '0 16px 40px rgba(18,35,64,0.08)' }}
            >
              <Truck size={28} style={{ color: '#0a4b8e' }} />
              <h4 className="mt-10 text-lg font-medium" style={{ color: '#17315d' }}>이사 서비스</h4>
              <p className="mt-2 text-sm leading-6" style={{ color: '#7a879a' }}>
                전문 이사 업체 연계 원스톱 이삿짐 운반 서비스.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 박람회 일정 + 장소 ── */}
      <section style={{ background: '#edf1f5' }}>
        <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-14 lg:grid-cols-2 lg:px-10 lg:py-20">

          {/* Schedule */}
          <div>
            <h2
              className="font-light"
              style={{ fontSize: '38px', letterSpacing: '-0.05em', color: '#12305f' }}
            >
              진행 중인 박람회
            </h2>

            {activeEvents.length === 0 ? (
              <div className="mt-10 rounded-[24px] bg-white py-16 text-center" style={{ boxShadow: '0 12px 30px rgba(18,35,64,0.06)' }}>
                <p className="text-4xl mb-3">🏢</p>
                <p className="text-sm" style={{ color: '#718096' }}>현재 진행 중인 박람회가 없습니다</p>
              </div>
            ) : (
              <div className="mt-10 space-y-4">
                {activeEvents.map((event) => {
                  const startDate = event.dates[0] ? formatDate(event.dates[0]) : '';
                  const endDate = event.dates.length > 1 ? formatDate(event.dates[event.dates.length - 1]) : '';
                  const timeRange = getTimeRange(event);
                  const dateObj = event.dates[0] ? new Date(event.dates[0]) : null;
                  const month = dateObj ? (dateObj.getMonth() + 1) + '월' : '';
                  const day = dateObj ? dateObj.getDate() : '';

                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-6 bg-white px-7 py-6 cursor-pointer transition-all hover:shadow-lg"
                      style={{ borderRadius: '24px', boxShadow: '0 12px 30px rgba(18,35,64,0.08)' }}
                      onClick={() => navigate(`/e/${event.slug}`)}
                    >
                      {dateObj && (
                        <div className="min-w-[64px] text-center flex-shrink-0">
                          <div className="text-sm tracking-[0.1em]" style={{ color: '#637594' }}>{month}</div>
                          <div
                            className="font-light leading-none"
                            style={{ fontSize: '42px', letterSpacing: '-0.06em', color: '#12305f' }}
                          >
                            {day}
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium truncate" style={{ color: '#17315d' }}>
                          {event.title}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="text-sm flex items-center gap-1" style={{ color: '#6f7d90' }}>
                            <MapPin size={12} />{event.address}
                          </span>
                          {timeRange && (
                            <span className="text-sm flex items-center gap-1" style={{ color: '#6f7d90' }}>
                              <Clock size={12} />{timeRange}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs" style={{ color: '#9aa5b4' }}>
                          {startDate}{endDate && ` ~ ${endDate}`}
                        </div>
                      </div>
                      <ArrowRight size={16} style={{ color: '#9aa5b4', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => navigate('/events')}
                className="inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
                style={{ color: '#12305f' }}
              >
                전체 박람회 보기 <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2
              className="font-light"
              style={{ fontSize: '38px', letterSpacing: '-0.05em', color: '#12305f' }}
            >
              박람회 장소
            </h2>
            <div
              className="mt-10 bg-white p-5"
              style={{ borderRadius: '30px', boxShadow: '0 16px 40px rgba(18,35,64,0.08)' }}
            >
              <div
                className="relative overflow-hidden flex items-end"
                style={{ borderRadius: '24px', background: '#e4e7eb', minHeight: '360px' }}
              >
                {heroEvent?.imageUrl ? (
                  <img
                    src={heroEvent.imageUrl}
                    alt="박람회 장소"
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building size={64} style={{ color: '#8fa8c8' }} />
                  </div>
                )}
                {heroEvent && (
                  <div
                    className="relative px-6 py-5 m-5 bg-white"
                    style={{ borderRadius: '18px', boxShadow: '0 12px 25px rgba(18,35,64,0.12)' }}
                  >
                    <div className="text-sm font-semibold" style={{ color: '#17315d' }}>
                      {heroEvent.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#718096' }}>
                      <MapPin size={11} />{heroEvent.address}
                    </div>
                  </div>
                )}
                {!heroEvent && (
                  <div
                    className="relative px-6 py-5 m-5 bg-white"
                    style={{ borderRadius: '18px', boxShadow: '0 12px 25px rgba(18,35,64,0.12)' }}
                  >
                    <div className="text-sm font-semibold" style={{ color: '#17315d' }}>박람회 장소 안내</div>
                    <div className="mt-1 text-xs" style={{ color: '#718096' }}>진행 중인 박람회가 없습니다</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
