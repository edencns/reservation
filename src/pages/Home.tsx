import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';
import { ArrowRight, MapPin, Clock, Building, ShieldCheck, Truck, BadgeCheck } from 'lucide-react';

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
const MAP_FALLBACK =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80';

export default function Home() {
  const navigate = useNavigate();
  const { events } = useApp();

  const activeEvents = events.filter((e) => e.status === 'active');
  const heroEvent = activeEvents[0];

  const getTimeRange = (event: (typeof events)[0]) => {
    if (event.startTime || event.endTime)
      return `${event.startTime ?? ''} ~ ${event.endTime ?? ''}`.trim();
    const slots = event.timeSlots ?? [];
    if (!slots.length) return '';
    const first = slots[0]?.time;
    const last = slots[slots.length - 1]?.time;
    if (!first || first === '시간 미지정') return '';
    return first === last ? first : `${first} ~ ${last}`;
  };

  return (
    <div className="bg-[#f5f7fa] text-[#0d2754]">

      {/* ─── Hero ─── */}
      <section className="mx-auto grid w-full max-w-[1280px] gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-20">

        {/* Left */}
        <div className="flex flex-col justify-center">
          <span className="mb-8 inline-flex w-fit rounded-full bg-[#dbe5f7] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c76a8]">
            프리미엄 입주 박람회
          </span>

          <h1 className="max-w-[540px] text-[48px] font-light leading-[1.02] tracking-[-0.05em] text-[#0c2a5e] md:text-[64px] lg:text-[72px]">
            새로운 시작을<br />
            위한 특별한<br />
            <span className="text-[#3a6db5]">입주 경험.</span>
          </h1>

          <p className="mt-8 max-w-[480px] text-[17px] leading-[1.85] text-[#5f7089]">
            인테리어, 금융, 보안, 이사까지 — 입주에 필요한 모든 것을 한 곳에서.
            전문 업체와의 독점 파트너십으로 최상의 조건을 제공합니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/events')}
              className="inline-flex items-center gap-3 rounded-xl bg-[#0a4b8e] px-7 py-4 text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(10,75,142,0.28)] transition hover:opacity-90 active:scale-[0.98]"
            >
              박람회 예약하기 <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/my-tickets')}
              className="rounded-xl border border-[#d8e2ef] bg-white px-7 py-4 text-[15px] font-medium text-[#1c345c] shadow-sm transition hover:bg-[#f0f4fb]"
            >
              내 예약 확인
            </button>
          </div>
        </div>

        {/* Right – image + floating card */}
        <div className="relative hidden min-h-[500px] lg:block">
          <div className="absolute right-0 top-0 h-[460px] w-full max-w-[580px] overflow-hidden rounded-[36px] shadow-[0_30px_70px_rgba(13,39,84,0.14)]">
            <img
              src={heroEvent?.imageUrl || HERO_FALLBACK}
              alt="박람회 이미지"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c2a5e]/30 to-transparent" />
          </div>

          <div className="absolute bottom-8 left-0 max-w-[320px] rounded-[24px] bg-white px-6 py-5 shadow-[0_20px_50px_rgba(13,39,84,0.14)]">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eaf1fb]">
                <BadgeCheck size={18} className="text-[#0a4b8e]" />
              </div>
              <div>
                <p className="font-semibold text-[#172e57]">
                  {heroEvent ? heroEvent.title : '공식 파트너'}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6e7a8e]">
                  {heroEvent
                    ? heroEvent.address
                    : '전국 200여 개 주거단지에서 검증된 최고의 파트너십.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-12 lg:px-10 lg:py-20">
        <h2 className="text-[36px] font-light tracking-[-0.04em] text-[#12305f]">입주민 혜택</h2>
        <p className="mt-3 text-[16px] text-[#718096]">
          박람회 참가자만을 위한 독점 서비스를 경험해 보세요.
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">

          {/* Large card – Interior */}
          <div className="flex flex-col rounded-[30px] bg-white p-8 shadow-[0_16px_40px_rgba(13,39,84,0.07)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dceafe]">
              <Building size={22} className="text-[#0a4b8e]" />
            </div>
            <h3 className="mt-10 max-w-[300px] text-[32px] font-light leading-[1.1] tracking-[-0.04em] text-[#12305f]">
              인테리어<br />코디네이션
            </h3>
            <p className="mt-5 max-w-[380px] flex-grow text-[16px] leading-[1.9] text-[#6e7b90]">
              프리미엄 마감재와 최고의 디자이너를 박람회 특가로 만나보세요.
              입주민 전용 특별 할인 혜택을 제공합니다.
            </p>
            <button
              onClick={() => navigate('/events')}
              className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-[#12305f] transition hover:opacity-60"
            >
              자세히 보기 <ArrowRight size={14} />
            </button>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">

            {/* Financial – dark */}
            <div className="flex flex-col justify-between rounded-[30px] bg-[#0b4a8a] p-8 text-white shadow-[0_16px_40px_rgba(13,39,84,0.18)]" style={{ minHeight: '200px' }}>
              <div>
                <h3 className="text-[30px] font-light leading-tight tracking-[-0.04em]">금융 컨설팅</h3>
                <p className="mt-4 max-w-[300px] text-[15px] leading-7 text-white/70">
                  신규 분양 입주를 위한 전략적 모기지 및 보험 설계. 최적의 금융 플랜을 제안해 드립니다.
                </p>
              </div>
              <div className="self-end text-white/20">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
            </div>

            {/* Security + Moving */}
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col rounded-[24px] bg-white p-7 shadow-[0_16px_40px_rgba(13,39,84,0.07)]">
                <ShieldCheck size={28} className="text-[#0a4b8e]" />
                <h4 className="mt-10 text-[17px] font-medium text-[#17315d]">스마트 보안</h4>
                <p className="mt-2 text-sm leading-6 text-[#7a879a]">스마트홈 통합 솔루션 구성.</p>
              </div>
              <div className="flex flex-col rounded-[24px] bg-white p-7 shadow-[0_16px_40px_rgba(13,39,84,0.07)]">
                <Truck size={28} className="text-[#0a4b8e]" />
                <h4 className="mt-10 text-[17px] font-medium text-[#17315d]">이사 서비스</h4>
                <p className="mt-2 text-sm leading-6 text-[#7a879a]">전문 업체 원스톱 연계.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Schedule + Location ─── */}
      <section className="bg-[#edf1f7]">
        <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-14 lg:grid-cols-2 lg:px-10 lg:py-20">

          {/* Schedule */}
          <div>
            <h2 className="text-[36px] font-light tracking-[-0.04em] text-[#12305f]">진행 중인 박람회</h2>

            {activeEvents.length === 0 ? (
              <div className="mt-10 rounded-[24px] bg-white py-16 text-center shadow-[0_12px_30px_rgba(13,39,84,0.06)]">
                <p className="text-3xl mb-3">🏢</p>
                <p className="text-sm text-[#718096]">현재 진행 중인 박람회가 없습니다</p>
              </div>
            ) : (
              <div className="mt-10 space-y-4">
                {activeEvents.map((event) => {
                  const startDate = event.dates[0] ? formatDate(event.dates[0]) : '';
                  const endDate =
                    event.dates.length > 1 ? formatDate(event.dates[event.dates.length - 1]) : '';
                  const timeRange = getTimeRange(event);
                  const dateObj = event.dates[0] ? new Date(event.dates[0]) : null;
                  const month = dateObj ? `${dateObj.getMonth() + 1}월` : '';
                  const day = dateObj ? dateObj.getDate() : '';

                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/e/${event.slug}`)}
                      className="flex cursor-pointer items-center gap-6 rounded-[24px] bg-white px-7 py-6 shadow-[0_12px_30px_rgba(13,39,84,0.07)] transition hover:shadow-[0_16px_40px_rgba(13,39,84,0.12)] hover:-translate-y-0.5"
                    >
                      {dateObj && (
                        <div className="min-w-[60px] flex-shrink-0 text-center">
                          <span className="block text-xs tracking-[0.1em] text-[#637594]">{month}</span>
                          <span className="block text-[42px] font-light leading-none tracking-[-0.05em] text-[#12305f]">
                            {day}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[17px] font-medium text-[#17315d]">{event.title}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 text-sm text-[#6f7d90]">
                            <MapPin size={12} /> {event.address}
                          </span>
                          {timeRange && (
                            <span className="flex items-center gap-1 text-sm text-[#6f7d90]">
                              <Clock size={12} /> {timeRange}
                            </span>
                          )}
                        </div>
                        {(startDate || endDate) && (
                          <p className="mt-1 text-xs text-[#9aa5b4]">
                            {startDate}{endDate && ` ~ ${endDate}`}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={16} className="flex-shrink-0 text-[#b0bece]" />
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate('/events')}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#12305f] transition hover:opacity-60"
            >
              전체 박람회 보기 <ArrowRight size={14} />
            </button>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-[36px] font-light tracking-[-0.04em] text-[#12305f]">박람회 장소</h2>
            <div className="mt-10 rounded-[30px] bg-white p-5 shadow-[0_16px_40px_rgba(13,39,84,0.08)]">
              <div className="relative overflow-hidden rounded-[22px] bg-[#dde1e7]" style={{ height: '360px' }}>
                <img
                  src={heroEvent?.imageUrl || MAP_FALLBACK}
                  alt="박람회 장소"
                  className="h-full w-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c2a5e]/20" />
                <div className="absolute left-6 top-6 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_25px_rgba(13,39,84,0.14)]">
                  <p className="text-sm font-semibold text-[#17315d]">
                    {heroEvent?.title ?? '박람회 장소 안내'}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#718096]">
                    <MapPin size={11} />
                    {heroEvent?.address ?? '장소 정보가 없습니다'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
