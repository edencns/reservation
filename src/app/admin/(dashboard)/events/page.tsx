'use client';

import { useState } from 'react';

/* ── 이벤트 데이터 ── */
const events = [
  {
    id: 0,
    name: '힐스테이트 광교 입주 박람회',
    date: '2025.04.12 ~ 04.13',
    location: '광교 A동 커뮤니티센터',
    status: '모집중',
    statusColor: '#0eb077',
    statusBg: '#e5f7f0',
    barColor: '#0eb077',
    count: '284명 예약',
  },
  {
    id: 1,
    name: '래미안 원베일리 입주 박람회',
    date: '2025.04.19 ~ 04.20',
    location: '반포 B동 주민홀',
    status: '모집중',
    statusColor: '#2660f0',
    statusBg: '#ebefff',
    barColor: '#2660f0',
    count: '197명 예약',
  },
  {
    id: 2,
    name: '디에이치 방배 입주 박람회',
    date: '2025.04.26 ~ 04.27',
    location: '방배 커뮤니티센터',
    status: '곧 시작',
    statusColor: '#ed9208',
    statusBg: '#fef3e3',
    barColor: '#ed9208',
    count: '91명 예약',
  },
  {
    id: 3,
    name: '아크로 리버하임 입주 박람회',
    date: '2025.05.03',
    location: '서초 커뮤니티홀',
    status: '곧 시작',
    statusColor: '#ed9208',
    statusBg: '#fef3e3',
    barColor: '#ed9208',
    count: '준비중',
  },
];

type FilterType = '전체' | '모집중' | '곧 시작' | '종료';

const filters: FilterType[] = ['전체', '모집중', '곧 시작', '종료'];

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('전체');

  const filteredEvents =
    activeFilter === '전체'
      ? events
      : events.filter((ev) => ev.status === activeFilter);

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex flex-col">
      {/* ─────────── Header ─────────── */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.06)] h-16">
        <div className="max-w-[1280px] mx-auto px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4523eb 14.6%, #2660f0 85.4%)' }}
            >
              <span className="text-white text-[13px] font-extrabold tracking-wide">ET</span>
            </div>
            <span className="text-[#0e1427] text-base font-bold">EDEN Ticket</span>
          </div>
          <nav className="flex gap-10">
            <a href="/events" className="text-[#2660f0] text-sm font-semibold">
              이벤트
            </a>
            <a href="/lookup" className="text-[#6b7283] text-sm hover:text-[#0e1427] transition-colors">
              예약 조회
            </a>
          </nav>
        </div>
      </header>

      {/* ─────────── Content ─────────── */}
      <main className="max-w-[1280px] mx-auto w-full flex-1 pl-48 pr-10 pt-8 pb-10">
        <h1 className="text-[26px] font-bold text-[#0e1427]">이벤트 목록</h1>
        <p className="text-sm text-[#6b7283] mt-1">참여하실 박람회를 선택해 주세요</p>

        {/* 필터 탭 */}
        <div className="flex gap-4 mt-6 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`h-[34px] w-[88px] rounded-lg text-[13px] transition-all ${
                activeFilter === f
                  ? 'text-white font-semibold'
                  : 'bg-[#eff0f4] text-[#4f576a] hover:bg-[#e5e7ec]'
              }`}
              style={
                activeFilter === f
                  ? { background: 'linear-gradient(167deg, #4523eb 13.4%, #2660f0 86.6%)' }
                  : undefined
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* 이벤트 행 */}
        <div className="flex flex-col gap-[16px]">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="relative bg-white rounded-xl shadow-[0_3px_12px_rgba(0,0,0,0.05)] h-[94px] flex items-center overflow-hidden"
            >
              {/* 왼쪽 컬러 바 */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: ev.barColor }}
              />

              {/* 콘텐츠 */}
              <div className="pl-6 flex-1">
                <p className="text-base font-semibold text-[#0e1427]">{ev.name}</p>
                <p className="text-xs text-[#6b7283] mt-[6px]">
                  {ev.date} · {ev.location}
                </p>
                <div
                  className="inline-flex items-center justify-center rounded-[5px] px-[10px] py-[5px] mt-[6px]"
                  style={{ backgroundColor: ev.statusBg }}
                >
                  <span className="text-[10px] font-semibold" style={{ color: ev.statusColor }}>
                    {ev.status}
                  </span>
                </div>
              </div>

              {/* 예약 수 */}
              <span className="text-[13px] font-medium text-[#4f576a] mr-10">{ev.count}</span>

              {/* 선택 버튼 */}
              <button
                className="w-[102px] h-11 rounded-[10px] text-[13px] font-semibold text-white mr-6 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(166deg, #4523eb 13.4%, #2660f0 86.6%)' }}
              >
                선택
              </button>
            </div>
          ))}
        </div>
      </main>

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
