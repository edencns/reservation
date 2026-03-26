"use client";

import { useState } from "react";

const GRAD = "linear-gradient(120deg, #2660f0 0%, #4523eb 100%)";

const EVENT_TABS = ["전체 종합", "힐스테이트 광교", "래미안 원베일리", "디에이치 방배"] as const;
type EventTab = (typeof EVENT_TABS)[number];

const TABLE_ROWS = [
  { name: "김민준", unit: "101동 1502호", event: "힐스테이트 광교", visited: true },
  { name: "이서연", unit: "205동 803호",  event: "래미안 원베일리", visited: false },
  { name: "박도윤", unit: "101동 302호",  event: "힐스테이트 광교", visited: true },
  { name: "최지아", unit: "108동 1201호", event: "디에이치 방배",   visited: true },
  { name: "정하은", unit: "205동 1104호", event: "래미안 원베일리", visited: false },
  { name: "강민서", unit: "101동 2201호", event: "힐스테이트 광교", visited: true },
];

const EVENT_STATS = [
  { name: "힐스테이트 광교", total: 284, visited: 249 },
  { name: "래미안 원베일리", total: 197, visited: 162 },
  { name: "디에이치 방배",   total: 91,  visited: 70  },
];

const SIDEBAR_MENUS = [
  { label: "대시보드",   path: "/admin",              active: true  },
  { label: "이벤트 관리", path: "/admin/events",       active: false },
  { label: "예약 관리",  path: "/admin/reservations", active: false },
  { label: "통계",       path: "/admin/statistics",   active: false },
  { label: "정산",       path: "/admin/settlement",   active: false },
  { label: "업체 관리",  path: "/admin/vendors",      active: false },
  { label: "계약 관리",  path: "/admin/contracts",    active: false },
  { label: "회사 정보",  path: "/admin/company",      active: false },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<EventTab>("전체 종합");

  const kpis = [
    { label: "총 예약",         value: "1,248", sub: "전체 누적",       accent: "#2660f0" },
    { label: "오늘 체크인",     value: "87",    sub: "목표 대비 92%",   accent: "#0eb077" },
    { label: "진행 중 이벤트",  value: "3",     sub: "현재 활성",       accent: "#ed9208" },
    { label: "미방문율",        value: "12.4%", sub: "예약 대비 미방문", accent: "#db3838" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d1227" }}>
      {/* ── SIDEBAR ── */}
      <aside className="relative flex w-[220px] flex-shrink-0 flex-col" style={{ background: "#111830" }}>
        {/* 좌측 그라디언트 선 */}
        <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: GRAD }} />

        {/* 로고 */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[13px] font-extrabold text-white"
            style={{ background: GRAD }}
          >
            ET
          </div>
          <div>
            <p className="text-[13px] font-bold text-white">EDEN Ticket</p>
            <p className="text-[10px]" style={{ color: "#6478ae" }}>관리자</p>
          </div>
        </div>

        <div className="mx-5 h-px" style={{ background: "#1e2d4e" }} />

        {/* 메뉴 */}
        <nav className="mt-2 flex flex-col gap-0.5 px-3">
          {SIDEBAR_MENUS.map((m) => (
            <a
              key={m.path}
              href={m.path}
              className="flex items-center rounded-[10px] px-4 py-[11px] text-[13px] transition-colors"
              style={{
                background: m.active ? "rgba(38,96,240,0.20)" : "transparent",
                color: m.active ? "#fff" : "#6478ae",
                fontWeight: m.active ? 600 : 400,
              }}
            >
              {m.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex flex-1 flex-col overflow-auto" style={{ background: "#0d1227" }}>
        {/* Top bar */}
        <div className="flex items-end gap-4 px-7 pt-5 pb-3" style={{ background: "#111830" }}>
          <div>
            <h1 className="text-[20px] font-bold text-white">대시보드</h1>
            <p className="text-[11px]" style={{ color: "#6478ae" }}>
              이벤트를 선택하면 해당 행사 데이터를 확인할 수 있습니다
            </p>
          </div>
        </div>

        {/* 이벤트 선택 탭 */}
        <div className="flex gap-2 px-7 py-3">
          {EVENT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex h-8 min-w-[174px] items-center justify-center rounded-[8px] text-[12px] transition-all"
              style={
                activeTab === tab
                  ? { background: GRAD, color: "#fff", fontWeight: 600 }
                  : { background: "#151e36", color: "#6478ae", fontWeight: 400 }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto px-7 pb-7">
          {/* KPI 카드 */}
          <div className="mb-5 grid grid-cols-4 gap-5">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="relative overflow-hidden rounded-[14px]"
                style={{ background: "#151e36", boxShadow: "0px 3px 12px rgba(0,0,0,0.18)" }}
              >
                {/* 상단 컬러 바 */}
                <div
                  className="h-1 w-full rounded-t-[14px]"
                  style={{ background: k.accent }}
                />
                <div className="px-[18px] pb-[18px] pt-4">
                  <p className="mb-2 text-[12px]" style={{ color: "#6478ae" }}>{k.label}</p>
                  <p className="mb-2 text-[30px] font-bold text-white leading-none">{k.value}</p>
                  <p className="text-[11px]" style={{ color: "#6478ae" }}>{k.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 테이블 + 이벤트 패널 */}
          <div className="flex gap-5">
            {/* 예약 테이블 */}
            <div
              className="flex-1 rounded-[14px] overflow-hidden"
              style={{ background: "#151e36", boxShadow: "0px 3px 12px rgba(0,0,0,0.18)" }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4">
                <p className="text-[15px] font-semibold text-white">최근 예약 현황</p>
                <button className="text-[11px]" style={{ color: "#6a91e4" }}>
                  전체보기 →
                </button>
              </div>

              {/* 헤더 행 */}
              <div
                className="grid px-6 py-2 text-[11px] font-semibold"
                style={{
                  gridTemplateColumns: "120px 140px 1fr 80px",
                  background: "#0d1227",
                  color: "#546a9e",
                }}
              >
                <span>예약자</span>
                <span>동호수</span>
                <span>이벤트</span>
                <span>방문</span>
              </div>

              {TABLE_ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid items-center px-6 py-3 text-[12px]"
                  style={{
                    gridTemplateColumns: "120px 140px 1fr 80px",
                    background: i % 2 === 0 ? "#111830" : "transparent",
                  }}
                >
                  <span className="font-medium text-white">{row.name}</span>
                  <span style={{ color: "#94a8cc" }}>{row.unit}</span>
                  <span style={{ color: "#7d96bf" }}>{row.event}</span>
                  <span>
                    <span
                      className="inline-block rounded-[5px] px-2 py-0.5 text-[11px] font-semibold"
                      style={
                        row.visited
                          ? { background: "#e5f7f0", color: "#0eb077" }
                          : { background: "#fde8e8", color: "#db3838" }
                      }
                    >
                      {row.visited ? "방문" : "미방문"}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* 이벤트별 현황 패널 */}
            <div
              className="w-[356px] flex-shrink-0 rounded-[14px] p-5"
              style={{ background: "#151e36", boxShadow: "0px 3px 12px rgba(0,0,0,0.18)" }}
            >
              <p className="mb-4 text-[15px] font-semibold text-white">이벤트별 예약 현황</p>

              <div className="flex flex-col gap-3">
                {EVENT_STATS.map((ev) => {
                  const vPct = Math.round((ev.visited / ev.total) * 100);
                  const aPct = 100 - vPct;
                  const absent = ev.total - ev.visited;

                  return (
                    <div
                      key={ev.name}
                      className="rounded-[10px] p-4"
                      style={{ background: "#111d38" }}
                    >
                      <p className="mb-1 text-[13px] font-semibold text-white">{ev.name}</p>
                      <p className="mb-3 text-[11px]" style={{ color: "#6478ae" }}>
                        총 {ev.total}명
                      </p>

                      {/* 프로그레스 바 */}
                      <div className="mb-2 h-2 w-full rounded-full" style={{ background: "#1a2645" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${vPct}%`, background: GRAD }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px]">
                        <span style={{ color: "#0eb077" }}>
                          방문 {ev.visited} ({vPct}%)
                        </span>
                        <span style={{ color: "#db3838" }}>
                          미방문 {absent} ({aPct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
