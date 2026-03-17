import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const HERO_FALLBACK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCIiMFm2XV8ch4m68axAqmmosewUPaAIGQC-zWjkauJO9OpyG-gFTOQi82eSg3U3mGQ-wKs4z-ehRCKAGrfcTidN_UQaoHDeAMFsXOvMUAw_Ye9skMuwF_Vx7l_IReARpEgsXoRAyG5Jnf_GQ5JIUfoWf2kdUItIUR0vRpnD5HEGdwsuyAoT-3Is0oPhOQsMUjhfcKzmt1cvvFA0CZ7PrFxsFbb-eTiSr5FMdt0_lmMqfe3jtgQDFS2apZZLGzGC4-NrgGnHVFbgukV';
const MAP_FALLBACK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDf2u7lO_UuWCNEK8-UgUp7pDWhQujcN1PH5iSgKoGGRalYYmYXIHjsehsFibipDAWjWtYCdFBTL2kWSDJ5m8a-AbmeqDAbGrp3A81zWT6rh5wdk2rTDqm8D-V_Tkp3lVjf6v5OPTUuLNcYFzAoLt2Sk4O2hoKmLxlgNCYkBd6e_aCbk213xYJ2rFAw98ODRPxE-LnlprRyeUjVnIC5sFFRhHTfpf9zKu-FWs7LelkDRpWcALIHIvYHI8bXPKCoBVysIKqIysjkhQPN';

export default function Home() {
  const navigate = useNavigate();
  const { events } = useApp();

  const activeEvents = events.filter((e) => e.status === 'active');
  const heroEvent = activeEvents[0];

  return (
    <div className="bg-surface text-on-surface">

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[85vh] flex items-center px-8 md:px-20 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">
          <div className="z-10 py-20">
            <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest mb-6">
              프리미엄 입주 박람회
            </span>
            <h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-primary leading-tight mb-8">
              새로운 시작을,<br />
              <span className="text-primary-container font-light">완벽하게 준비.</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg mb-12">
              인테리어, 금융, 보안, 이사까지 — 입주에 필요한 모든 것을 한 곳에서.
              전문 업체와의 독점 파트너십으로 최상의 조건을 제공합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/events')}
                className="hero-gradient text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:scale-[1.02] transition-transform"
              >
                박람회 예약하기
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/my-tickets')}
                className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold border border-outline-variant/20 hover:bg-surface-container transition-colors"
              >
                내 예약 확인
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative">
              <img
                alt="박람회 이미지"
                className="w-full h-full object-cover"
                src={heroEvent?.imageUrl || HERO_FALLBACK}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
            </div>
            {/* Asymmetric accent card */}
            <div className="absolute -bottom-8 -left-8 bg-surface-container-lowest p-6 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-4 mb-3">
                <span className="material-symbols-outlined text-primary-container text-3xl">verified</span>
                <span className="text-on-surface font-headline font-bold">공식 파트너</span>
              </div>
              <p className="text-xs text-on-surface-variant">전국 200개 이상 아파트 단지 검증 완료.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento Grid – Resident Benefits ─── */}
      <section className="py-24 bg-surface-container-low px-8 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-headline font-extrabold text-primary mb-2">입주민 혜택</h2>
            <p className="text-on-surface-variant">박람회 참가자만을 위한 독점 서비스를 경험하세요.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Large Card */}
            <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest p-10 rounded-3xl flex flex-col justify-between group cursor-pointer border border-transparent hover:border-primary-fixed-dim transition-all">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-primary text-3xl">home_max</span>
                </div>
                <h3 className="text-3xl font-headline font-bold text-primary mb-6">풀서비스 인테리어 코디네이션</h3>
                <p className="text-on-surface-variant leading-relaxed text-lg">
                  톱티어 디자이너와 프리미엄 마감재를 박람회 참가자 전용 도매가로 만나보세요.
                </p>
              </div>
              <div className="flex items-center text-primary font-bold gap-2">
                서비스 보기 <span className="material-symbols-outlined">north_east</span>
              </div>
            </div>
            {/* Top Small Card */}
            <div className="md:col-span-2 bg-primary-container p-8 rounded-3xl text-on-primary flex items-center justify-between">
              <div className="max-w-xs">
                <h3 className="text-2xl font-headline font-bold mb-4">금융 컨설팅</h3>
                <p className="text-on-primary/70 text-sm">신규 주택 소유자를 위한 전략적 대출 및 보험 설계.</p>
              </div>
              <span className="material-symbols-outlined text-6xl opacity-30">account_balance</span>
            </div>
            {/* Bottom Small Cards */}
            <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-end">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">security</span>
              <h4 className="font-headline font-bold text-primary">첨단 보안</h4>
              <p className="text-xs text-on-surface-variant">스마트홈 통합 패키지.</p>
            </div>
            <div className="bg-surface-container-high p-8 rounded-3xl flex flex-col justify-end">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">local_shipping</span>
              <h4 className="font-headline font-bold text-primary">우선 이사</h4>
              <p className="text-xs text-on-surface-variant">컨시어지 화이트글러브 운송.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Schedule & Location ─── */}
      <section className="py-24 px-8 md:px-20 bg-surface">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
          {/* Event Schedule */}
          <div>
            <h2 className="text-4xl font-headline font-extrabold text-primary mb-12">진행 중인 박람회</h2>
            <div className="space-y-6">
              {activeEvents.length === 0 ? (
                <div className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-8">
                  <div className="flex-grow text-center py-8">
                    <p className="text-on-surface-variant">현재 진행 중인 박람회가 없습니다.</p>
                  </div>
                </div>
              ) : (
                activeEvents.map((event) => {
                  const dateObj = event.dates[0] ? new Date(event.dates[0] + 'T00:00:00') : null;
                  const monthStr = dateObj
                    ? dateObj.toLocaleString('ko-KR', { month: 'short' }).replace('월', 'M')
                    : '';
                  const dayNum = dateObj ? dateObj.getDate() : '';
                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/e/${event.slug}`)}
                      className="bg-surface-container-lowest p-6 rounded-2xl flex items-center gap-8 group hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      {dateObj && (
                        <div className="text-center min-w-[80px]">
                          <span className="block text-2xl font-headline font-extrabold text-primary">{monthStr}</span>
                          <span className="block text-4xl font-headline font-extrabold text-outline">{dayNum}</span>
                        </div>
                      )}
                      <div className="flex-grow">
                        <h4 className="font-headline font-bold text-lg mb-1">{event.title}</h4>
                        <p className="text-sm text-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          {event.address}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Location Map */}
          <div>
            <h2 className="text-4xl font-headline font-extrabold text-primary mb-12">박람회 장소</h2>
            <div className="rounded-3xl overflow-hidden h-[400px] shadow-lg relative grayscale hover:grayscale-0 transition-all duration-700">
              <img
                alt="박람회 장소"
                className="w-full h-full object-cover"
                src={heroEvent?.imageUrl || MAP_FALLBACK}
              />
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-2xl flex items-center gap-4 border border-primary/20">
                  <span
                    className="material-symbols-outlined text-error text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >location_on</span>
                  <div>
                    <span className="block font-bold text-primary">
                      {heroEvent?.title ?? 'Grand Ballroom, COEX'}
                    </span>
                    <span className="block text-xs text-on-surface-variant">
                      {heroEvent?.address ?? '서울특별시'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
