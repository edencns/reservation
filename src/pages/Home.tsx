import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const HERO_FALLBACK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAyu0tclI7aNTV0eU7vxr8_BGzWwq53ZZEcPWUGabHxvs3v11XblHlP01CTxjYBFr3szO8gyn50E52tlG_7hm3pOAI3LUH7u7UYMa-Icv4mISoXWF4Ep5YPii2pBAvt7k2cF6qKtCxc0U7oFqnN_3viaHAHYsb1p_j_XIEZ7OoDw2wUdG8z5sgzUycwxb72QA2I2w20YmiiIZsKRciFcwxu761cBvVH26-Qg9UfnKurCQ6FaNvrhE_eEayzkj2PfQyGqYMtChwc6VKt';
const MAP_FALLBACK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA9zMnnaIRPq3nk1c-zrBbGfKsoZAgt_l87zT4bG-Jx7zNO7XLPc5sND5RiDLwBsbfMuQiJUbdgmrg5mrP52TJlpQMqKMHoYVHfj-HgJCs4kQ8Nx7z-F2XzLNtUbac6Jk-iVH-uQBDBLqXCDAsL4xg0cHL16ICmoX8DajP7tuwmQQ2iHD84FukqCZIwaNVE15Bui6kFEu1QpvMQBAEFj-JHO9N9nQPnK14VBrcg6XXIW5y3JRP7CQfnXZxS-GRRCdBRZ-JidheTWEy1';

export default function Home() {
  const navigate = useNavigate();
  const { events } = useApp();

  const activeEvents = events.filter((e) => e.status === 'active');
  const heroEvent = activeEvents[0];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-surface group/design-root overflow-x-hidden text-on-background selection:bg-primary-fixed">
      <main className="flex flex-col">

        {/* ─── Hero ─── */}
        <section className="px-6 lg:px-40 py-16 lg:py-24 bg-surface-container-low">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-[1280px] mx-auto">
            <div className="flex flex-col gap-8 order-2 lg:order-1">
              <div className="flex flex-col gap-4">
                <span className="text-primary font-bold tracking-widest text-xs uppercase bg-primary-fixed/30 w-fit px-3 py-1 rounded-full">
                  프리미엄 입주 박람회
                </span>
                <h1 className="font-headline text-on-background text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-[-0.03em]">
                  새로운 시작을,<br /><span className="text-primary-container">완벽하게 준비.</span>
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
                  <span className="truncate">박람회 예약하기</span>
                </button>
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-surface-container-lowest border border-outline-variant/30 text-primary text-base font-bold hover:bg-surface-container transition-all"
                >
                  <span className="truncate">내 예약 확인</span>
                </button>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-high" style={{boxShadow: '0 40px 60px -20px rgba(25,28,30,0.04)'}}>
                <img
                  alt="박람회 이미지"
                  className="w-full h-full object-cover"
                  src={heroEvent?.imageUrl || HERO_FALLBACK}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-6 rounded-lg hidden md:block" style={{boxShadow: '0 40px 60px -20px rgba(25,28,30,0.04)'}}>
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">house</span>
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
        <section className="px-6 lg:px-40 py-24 bg-surface" id="benefits">
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
              <div className="flex flex-col gap-6 p-8 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container-lowest border border-transparent hover:border-outline-variant/10" style={{}}>
                <div className="size-14 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-3xl">sell</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-headline text-on-surface text-xl font-bold">독점 특가</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    주요 가구 브랜드, 스마트 가전, 바닥재 솔루션 최대 40% 그룹 할인.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 p-8 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container-lowest border border-transparent hover:border-outline-variant/10">
                <div className="size-14 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">design_services</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-headline text-on-surface text-xl font-bold">인테리어 상담</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    전문 인테리어 디자이너와 1:1 무료 상담으로 완벽한 공간을 계획하세요.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6 p-8 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container-lowest border border-transparent hover:border-outline-variant/10">
                <div className="size-14 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                  <span className="material-symbols-outlined text-3xl">verified_user</span>
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

        {/* ─── Active Events (Program Itinerary) ─── */}
        <section className="px-6 lg:px-40 py-24 bg-surface-container-low" id="schedule">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-headline text-on-background text-3xl lg:text-4xl font-bold tracking-tight mb-12">
              진행 중인 박람회
            </h2>
            <div className="flex flex-col gap-4">
              {activeEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-4xl mb-4">🏢</p>
                  <p className="text-on-surface-variant">현재 진행 중인 박람회가 없습니다</p>
                </div>
              ) : (
                activeEvents.map((event) => {
                  const dateObj = event.dates[0] ? new Date(event.dates[0]) : null;
                  const month = dateObj ? `${dateObj.getMonth() + 1}월` : '';
                  const day = dateObj ? dateObj.getDate() : '';
                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/e/${event.slug}`)}
                      className="group flex flex-col md:flex-row gap-6 p-6 lg:p-10 rounded-xl bg-surface-container-lowest border border-outline-variant/10 items-start md:items-center cursor-pointer hover:border-primary/20 transition-all"
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
                        <p className="font-body text-on-surface-variant">{event.address}</p>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant hidden md:block">east</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ─── Location ─── */}
        <section className="px-6 lg:px-40 py-24 bg-surface" id="location">
          <div className="max-w-[1280px] mx-auto grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <h2 className="font-headline text-on-background text-3xl lg:text-4xl font-bold tracking-tight mb-4">박람회 장소</h2>
                <p className="font-body text-on-surface-variant text-lg">
                  {heroEvent?.address ?? '행사 장소는 박람회별로 확인하세요.'}
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                  <div>
                    <p className="font-bold text-on-surface">{heroEvent?.title ?? 'Central Convention Center'}</p>
                    <p className="text-on-surface-variant">{heroEvent?.address ?? '88 Olympic-ro, Songpa-gu, Seoul'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">directions_bus</span>
                  <div>
                    <p className="font-bold text-on-surface">대중교통</p>
                    <p className="text-on-surface-variant">지하철 및 버스 이용 가능</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">local_parking</span>
                  <div>
                    <p className="font-bold text-on-surface">주차</p>
                    <p className="text-on-surface-variant">방문객 4시간 무료 주차</p>
                  </div>
                </div>
              </div>
              <div className="p-8 rounded-xl bg-primary-container text-on-primary" style={{boxShadow: '0 40px 60px -20px rgba(25,28,30,0.04)'}}>
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
            <div className="lg:col-span-3 rounded-xl overflow-hidden bg-surface-container-high h-[500px] border border-outline-variant/10" style={{boxShadow: '0 40px 60px -20px rgba(25,28,30,0.04)'}}>
              <div className="w-full h-full bg-slate-200 relative">
                <img
                  alt="박람회 장소"
                  className="w-full h-full object-cover grayscale opacity-60"
                  src={heroEvent?.imageUrl || MAP_FALLBACK}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -top-12 -left-1/2 translate-x-1/2 bg-on-surface text-surface text-xs font-bold px-3 py-1.5 rounded whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-on-surface">
                      {heroEvent?.title ?? 'Grand Atrium Fair'}
                    </div>
                    <div className="size-6 bg-primary rounded-full border-4 border-surface animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="bg-surface-container-high px-6 lg:px-40 py-16 border-t border-outline-variant/15">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="flex items-center gap-4 text-primary">
              <div className="size-5">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor" />
                  <path d="M24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764L24 44L8.00004 35.7388C8.0104 36.0767 8.68485 36.6314 9.34546 37.1746C10.4222 37.7531 11.9291 38.2772 14.9242 39.319C17.9193 40.3608 22.1919 41 24 40Z" fill="currentColor" fillRule="evenodd" opacity="0.3" />
                </svg>
              </div>
              <h2 className="font-headline text-lg font-bold leading-tight">Move-In Fair</h2>
            </div>
            <div className="flex flex-wrap gap-8 text-sm font-medium text-on-surface-variant">
              <Link to="#" className="hover:text-primary transition-colors">개인정보 처리방침</Link>
              <Link to="#" className="hover:text-primary transition-colors">이용약관</Link>
              <Link to="#" className="hover:text-primary transition-colors">입점 신청</Link>
              <p>© 2024 Move-In Fair. All Rights Reserved.</p>
            </div>
            <div className="flex gap-4">
              <div className="size-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary-fixed transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-on-surface text-lg">share</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
