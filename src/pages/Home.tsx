import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';
import { ArrowRight, MapPin, Clock, Tag, Palette, ShieldCheck, ChevronRight } from 'lucide-react';

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
    <div className="bg-surface text-on-background selection:bg-primary-fixed">

      {/* ─── Hero ─── */}
      <section className="px-6 lg:px-40 py-16 lg:py-24 bg-surface-container-low">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-[1280px] mx-auto">

          {/* Left */}
          <div className="flex flex-col gap-8 order-2 lg:order-1">
            <div className="flex flex-col gap-4">
              <span className="text-primary font-bold tracking-widest text-xs uppercase bg-primary-fixed/30 w-fit px-3 py-1 rounded-full">
                프리미엄 입주 박람회
              </span>
              <h1 className="font-headline text-on-background text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-[-0.03em]">
                새로운 시작을,<br />
                <span className="text-primary-container">완벽하게 준비.</span>
              </h1>
              <p className="font-body text-on-surface-variant text-lg lg:text-xl leading-relaxed max-w-lg">
                인테리어, 금융, 보안, 이사까지 — 입주에 필요한 모든 것을 한 곳에서.
                전문 업체와의 독점 파트너십으로 최상의 조건을 제공합니다.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/events')}
                className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-gradient-to-r from-primary to-primary-container text-on-primary text-base font-bold shadow-xl hover:scale-[1.02] transition-transform"
              >
                박람회 예약하기
              </button>
              <button
                onClick={() => navigate('/my-tickets')}
                className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-surface-container-lowest border border-outline-variant/30 text-primary text-base font-bold hover:bg-surface-container transition-all"
              >
                내 예약 확인
              </button>
            </div>
          </div>

          {/* Right – image + floating card */}
          <div className="relative order-1 lg:order-2">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-high shadow-[0_40px_60px_-20px_rgba(25,28,30,0.1)]">
              <img
                src={heroEvent?.imageUrl || HERO_FALLBACK}
                alt="박람회 이미지"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-6 rounded-lg shadow-[0_40px_60px_-20px_rgba(25,28,30,0.08)] hidden md:block">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-on-surface font-bold text-lg">150+ 파트너사</p>
                  <p className="text-on-surface-variant text-sm">공식 인증 업체</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="px-6 lg:px-40 py-24 bg-surface">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="font-headline text-on-background text-3xl lg:text-4xl font-bold tracking-tight mb-4">입주민 혜택</h2>
              <p className="font-body text-on-surface-variant text-base lg:text-lg">
                박람회 참가자만을 위한 독점 서비스를 경험하세요. 모든 혜택이 한 곳에서.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-6 p-8 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container-lowest border border-transparent hover:border-outline-variant/10 hover:shadow-[0_40px_60px_-20px_rgba(25,28,30,0.06)]">
              <div className="size-14 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
                <Tag size={26} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-on-surface text-xl font-bold">독점 특가</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  주요 가구 브랜드, 스마트 가전, 바닥재 솔루션 최대 40% 그룹 할인.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6 p-8 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container-lowest border border-transparent hover:border-outline-variant/10 hover:shadow-[0_40px_60px_-20px_rgba(25,28,30,0.06)]">
              <div className="size-14 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                <Palette size={26} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-on-surface text-xl font-bold">인테리어 상담</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  전문 인테리어 디자이너와 1:1 무료 상담으로 완벽한 공간을 계획하세요.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6 p-8 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container-lowest border border-transparent hover:border-outline-variant/10 hover:shadow-[0_40px_60px_-20px_rgba(25,28,30,0.06)]">
              <div className="size-14 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                <ShieldCheck size={26} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-headline text-on-surface text-xl font-bold">검증된 파트너</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  품질, 애프터서비스, 전문 시공 인증을 완료한 검증된 업체들만 참가합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Active Events ─── */}
      <section className="px-6 lg:px-40 py-24 bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-headline text-on-background text-3xl lg:text-4xl font-bold tracking-tight mb-12">
            진행 중인 박람회
          </h2>

          {activeEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
              <p className="text-4xl mb-4">🏢</p>
              <p className="text-on-surface-variant">현재 진행 중인 박람회가 없습니다</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
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
                    className="group flex flex-col md:flex-row gap-6 p-6 lg:p-10 rounded-xl bg-surface-container-lowest border border-outline-variant/10 items-start md:items-center cursor-pointer hover:border-primary/20 hover:shadow-[0_40px_60px_-20px_rgba(25,28,30,0.06)] transition-all"
                  >
                    {dateObj && (
                      <div className="min-w-[120px]">
                        <span className="text-primary font-bold text-xl block">{month} {day}일</span>
                        <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest">예약 진행중</span>
                      </div>
                    )}
                    <div className="h-px md:h-12 w-full md:w-px bg-outline-variant/30" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline text-on-surface text-xl font-bold mb-1 truncate">{event.title}</h4>
                      <p className="font-body text-on-surface-variant flex items-center gap-2 flex-wrap">
                        <MapPin size={14} /> {event.address}
                        {timeRange && (
                          <>
                            <Clock size={14} className="ml-3" /> {timeRange}
                          </>
                        )}
                      </p>
                      {(startDate || endDate) && (
                        <p className="text-xs text-on-surface-variant/60 mt-1">
                          {startDate}{endDate && ` ~ ${endDate}`}
                        </p>
                      )}
                    </div>
                    <ArrowRight size={20} className="text-outline-variant hidden md:block flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => navigate('/events')}
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:opacity-70"
          >
            전체 박람회 보기 <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ─── Location ─── */}
      <section className="px-6 lg:px-40 py-24 bg-surface">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <h2 className="font-headline text-on-background text-3xl lg:text-4xl font-bold tracking-tight mb-4">박람회 장소</h2>
              <p className="font-body text-on-surface-variant text-lg">
                {heroEvent?.address ?? '행사 장소는 박람회별로 확인하세요.'}
              </p>
            </div>
            {heroEvent && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary mt-1 shrink-0" size={20} />
                  <div>
                    <p className="font-bold text-on-surface">{heroEvent.title}</p>
                    <p className="text-on-surface-variant">{heroEvent.address}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-8 rounded-xl bg-primary-container text-on-primary shadow-[0_40px_60px_-20px_rgba(25,28,30,0.1)]">
              <h4 className="font-headline text-lg font-bold mb-2">지금 바로 예약하세요</h4>
              <p className="opacity-80 text-sm mb-6">전문 컨설턴트와 함께 나만의 입주 플랜을 만들어보세요.</p>
              <button
                onClick={() => navigate('/events')}
                className="w-full h-12 rounded-lg bg-surface text-primary font-bold hover:bg-primary-fixed transition-colors"
              >
                박람회 예약하기
              </button>
            </div>
          </div>
          <div className="lg:col-span-3 rounded-xl overflow-hidden bg-surface-container-high h-[500px] border border-outline-variant/10 shadow-[0_40px_60px_-20px_rgba(25,28,30,0.08)]">
            <img
              src={heroEvent?.imageUrl || MAP_FALLBACK}
              alt="박람회 장소"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
