'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── 이벤트 데이터 ── */
const events = [
  {
    id: 0,
    status: '모집중',
    statusColor: '#0eb077',
    statusBg: '#e5f7f0',
    topBarColor: '#0eb077',
    name: ['힐스테이트 광교', '입주 박람회'],
    date: '2025.04.12 ~ 13',
    location: '광교 A동 커뮤니티센터',
    rate: 76,
  },
  {
    id: 1,
    status: '모집중',
    statusColor: '#2660f0',
    statusBg: '#ebefff',
    topBarColor: '#2660f0',
    name: ['래미안 원베일리', '입주 박람회'],
    date: '2025.04.19 ~ 20',
    location: '반포 B동 주민홀',
    rate: 51,
  },
  {
    id: 2,
    status: '곧 시작',
    statusColor: '#ed9208',
    statusBg: '#fef3e3',
    topBarColor: '#ed9208',
    name: ['디에이치 방배', '입주 박람회'],
    date: '2025.04.26 ~ 27',
    location: '방배 커뮤니티센터',
    rate: 23,
  },
  {
    id: 3,
    status: '곧 시작',
    statusColor: '#ed9208',
    statusBg: '#fef3e3',
    topBarColor: '#ed9208',
    name: ['아크로 리버하임', '입주 박람회'],
    date: '2025.05.03',
    location: '서초 커뮤니티홀',
    rate: 10,
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const maxSlide = Math.max(0, events.length - 3);

  const nextSlide = () => setCurrentSlide((p) => Math.min(p + 1, maxSlide));
  const prevSlide = () => setCurrentSlide((p) => Math.max(p - 1, 0));

  const visibleEvents = events.slice(currentSlide, currentSlide + 3);

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex flex-col">
      {/* ─────────── Header ─────────── */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.06)] h-16">
        <div className="max-w-[1280px] mx-auto px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#4523eb] to-[#2660f0] flex items-center justify-center">
              <span className="text-white text-[13px] font-extrabold tracking-wide">ET</span>
            </div>
            <span className="text-[#0e1427] text-base font-bold">EDEN Ticket</span>
          </div>
          <nav className="flex gap-10">
            <a href="/events" className="text-[#6b7283] text-sm hover:text-[#0e1427] transition-colors">
              이벤트
            </a>
            <a href="/lookup" className="text-[#6b7283] text-sm hover:text-[#0e1427] transition-colors">
              예약 조회
            </a>
          </nav>
        </div>
      </header>

      {/* ─────────── Hero ─────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(152deg, #0a0f32 13.4%, #1c0c4b 86.6%)' }}>
        {/* 장식 원 */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: -20,
            top: -60,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(69,35,235,0.35) 0%, rgba(38,96,240,0.15) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="max-w-[1280px] mx-auto pl-48 pr-10 pt-16 pb-11 relative z-10">
          {/* 배지 */}
          <div className="inline-flex items-center bg-white/[0.12] rounded-full px-5 py-[7px] mb-5">
            <span className="text-[#ccdefa] text-[11px] font-medium">아파트 입주 박람회 예약 플랫폼</span>
          </div>

          {/* 타이틀 */}
          <h1 className="text-white text-[50px] font-bold leading-[68px] mb-[6px]">
            스마트한 입주 박람회
            <br />
            방문 예약 서비스
          </h1>

          {/* 설명 */}
          <p className="text-[#b8ccf5] text-base mt-[10px]">
            간편하게 사전 예약하고, 당일 빠르게 입장하세요.
          </p>

          {/* 버튼 */}
          <div className="flex gap-4 mt-12">
            <button
              className="h-[50px] px-9 rounded-xl text-white text-[15px] font-semibold shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #4523eb 14.6%, #2660f0 85.4%)' }}
            >
              이벤트 둘러보기
            </button>
            <button className="h-[50px] px-9 rounded-xl text-white text-[15px] font-medium border-[1.5px] border-[#bfd1fa] opacity-75 hover:opacity-100 transition-opacity bg-transparent">
              예약 조회
            </button>
          </div>

          {/* 통계 바 */}
          <div className="inline-flex items-center bg-white/10 rounded-[10px] h-11 mt-4">
            <div className="flex flex-col px-[26px]">
              <span className="text-white text-[15px] font-bold">3,240건</span>
              <span className="text-[#9eb8e5] text-[11px] mt-0.5">누적 예약</span>
            </div>
            <div className="w-px h-[18px] bg-[#8ca6d9]" />
            <div className="flex flex-col px-[26px]">
              <span className="text-white text-[15px] font-bold">98%</span>
              <span className="text-[#9eb8e5] text-[11px] mt-0.5">만족도</span>
            </div>
            <div className="w-px h-[18px] bg-[#8ca6d9]" />
            <div className="flex flex-col px-[26px]">
              <span className="text-white text-[15px] font-bold">12개</span>
              <span className="text-[#9eb8e5] text-[11px] mt-0.5">진행 이벤트</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── 이벤트 섹션 ─────────── */}
      <section className="max-w-[1280px] mx-auto w-full pt-[38px] pb-5">
        <div className="pl-48 mb-6">
          <h2 className="text-[22px] font-bold text-[#0e1427]">진행 중인 이벤트</h2>
          <p className="text-sm text-[#6b7283] mt-[6px]">예약 가능한 박람회를 선택하세요</p>
        </div>

        {/* 캐러셀 영역 */}
        <div className="relative px-[136px] pl-48">
          {/* 왼쪽 화살표 */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute left-[136px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center z-10 transition-opacity disabled:opacity-30 hover:shadow-md"
          >
            <ChevronLeft size={18} className="text-[#4f576a]" />
          </button>

          {/* 카드 컨테이너 */}
          <div className="flex gap-[26px]">
            {visibleEvents.map((ev) => (
              <div
                key={ev.id}
                className="w-[316px] min-w-[316px] bg-white rounded-2xl shadow-[0_6px_22px_rgba(0,0,0,0.07)] overflow-hidden transition-all duration-300"
              >
                {/* 상단 컬러 바 */}
                <div
                  className="h-1 rounded-t-2xl"
                  style={{ backgroundColor: ev.topBarColor }}
                />

                <div className="p-5">
                  {/* 상태 배지 */}
                  <div
                    className="inline-flex items-center justify-center rounded-[5px] px-[10px] py-[5px] mb-3"
                    style={{ backgroundColor: ev.statusBg }}
                  >
                    <span className="text-[10px] font-semibold" style={{ color: ev.statusColor }}>
                      {ev.status}
                    </span>
                  </div>

                  {/* 제목 */}
                  <div className="mb-2">
                    {ev.name.map((line, idx) => (
                      <div key={idx} className="text-[15px] font-bold text-[#0e1427] leading-[22px]">
                        {line}
                      </div>
                    ))}
                  </div>

                  {/* 일시 & 장소 */}
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-xs text-[#6b7283]">{ev.date}</span>
                    <span className="text-xs text-[#6b7283]">{ev.location}</span>
                  </div>

                  {/* 구분선 */}
                  <div className="h-px bg-[#eff0f4] my-[14px]" />

                  {/* 예약 버튼 */}
                  <button
                    className="w-full h-[46px] rounded-[10px] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(174deg, #4523eb 13.4%, #2660f0 86.6%)' }}
                  >
                    예약하기
                  </button>

                  {/* 예약률 */}
                  <div className="flex justify-end mt-2 mb-[6px]">
                    <span className="text-[11px] text-[#b2b6bf]">예약률 {ev.rate}%</span>
                  </div>

                  {/* 프로그레스 바 */}
                  <div className="h-1 bg-[#eff0f4] rounded-sm">
                    <div
                      className="h-1 rounded-sm transition-all duration-700"
                      style={{
                        width: `${ev.rate}%`,
                        background: 'linear-gradient(to right, #4523eb, #2660f0)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 오른쪽 화살표 */}
          <button
            onClick={nextSlide}
            disabled={currentSlide >= maxSlide}
            className="absolute right-[136px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-opacity disabled:opacity-30 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4523eb 14.6%, #2660f0 85.4%)' }}
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>

        {/* 페이지네이션 도트 */}
        <div className="flex justify-center gap-[6px] mt-7 pb-5">
          {Array.from({ length: maxSlide + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-5'
                  : 'w-2 bg-[#d0d3db]'
              }`}
              style={
                i === currentSlide
                  ? { background: 'linear-gradient(135deg, #4523eb 14.6%, #2660f0 85.4%)' }
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {/* ─────────── Footer ─────────── */}
      <footer className="mt-auto bg-white border-t border-[#eff0f4]">
        <div className="max-w-[1280px] mx-auto pl-48 pr-10 py-[10px] flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#262e42]">EDEN Ticket</span>
          <span className="text-xs text-[#6b7283]">© 2025 EDEN Ticket. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
