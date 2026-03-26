"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── 데이터 ────────────────────────────────────────────────────────────────
const EVENT_TABS = ["전체 종합", "힐스테이트 광교", "래미안 원베일리", "디에이치 방배"] as const;
type EventTab = (typeof EVENT_TABS)[number];

const DATA: Record<EventTab, {
  kpi: { total: string; checkin: string; active: string; absentRate: string; checkinSub: string };
  rows: { name: string; unit: string; event: string; visited: boolean }[];
  events: { name: string; total: number; visited: number }[];
}> = {
  "전체 종합": {
    kpi: { total:"1,248", checkin:"87", active:"3", absentRate:"12.4%", checkinSub:"목표 대비 92%" },
    rows: [
      { name:"김민준", unit:"101동 1502호", event:"힐스테이트 광교",  visited:true  },
      { name:"이서연", unit:"205동 803호",  event:"래미안 원베일리",  visited:false },
      { name:"박도윤", unit:"101동 302호",  event:"힐스테이트 광교",  visited:true  },
      { name:"최지아", unit:"108동 1201호", event:"디에이치 방배",    visited:true  },
      { name:"정하은", unit:"205동 1104호", event:"래미안 원베일리",  visited:false },
      { name:"강민서", unit:"101동 2201호", event:"힐스테이트 광교",  visited:true  },
    ],
    events: [
      { name:"힐스테이트 광교", total:284, visited:249 },
      { name:"래미안 원베일리", total:197, visited:162 },
      { name:"디에이치 방배",   total:91,  visited:70  },
    ],
  },
  "힐스테이트 광교": {
    kpi: { total:"284", checkin:"43", active:"1", absentRate:"12.3%", checkinSub:"오늘 체크인" },
    rows: [
      { name:"김민준", unit:"101동 1502호", event:"힐스테이트 광교", visited:true  },
      { name:"박도윤", unit:"101동 302호",  event:"힐스테이트 광교", visited:true  },
      { name:"강민서", unit:"101동 2201호", event:"힐스테이트 광교", visited:true  },
      { name:"오지훈", unit:"102동 801호",  event:"힐스테이트 광교", visited:false },
    ],
    events: [{ name:"힐스테이트 광교", total:284, visited:249 }],
  },
  "래미안 원베일리": {
    kpi: { total:"197", checkin:"29", active:"1", absentRate:"17.8%", checkinSub:"오늘 체크인" },
    rows: [
      { name:"이서연", unit:"205동 803호",  event:"래미안 원베일리", visited:false },
      { name:"정하은", unit:"205동 1104호", event:"래미안 원베일리", visited:false },
      { name:"윤재원", unit:"206동 502호",  event:"래미안 원베일리", visited:true  },
    ],
    events: [{ name:"래미안 원베일리", total:197, visited:162 }],
  },
  "디에이치 방배": {
    kpi: { total:"91", checkin:"15", active:"1", absentRate:"23.1%", checkinSub:"오늘 체크인" },
    rows: [
      { name:"최지아", unit:"108동 1201호", event:"디에이치 방배", visited:true  },
      { name:"서지호", unit:"109동 303호",  event:"디에이치 방배", visited:false },
    ],
    events: [{ name:"디에이치 방배", total:91, visited:70 }],
  },
};

const MENU = [
  { label:"대시보드",   href:"/admin" },
  { label:"이벤트 관리",href:"/admin/events" },
  { label:"예약 관리",  href:"/admin/reservations" },
  { label:"통계",       href:"/admin/statistics" },
  { label:"정산",       href:"/admin/settlement" },
  { label:"업체 관리",  href:"/admin/vendors" },
  { label:"계약 관리",  href:"/admin/contracts" },
  { label:"회사 정보",  href:"/admin/company" },
];

const GRAD = "linear-gradient(-45deg, rgb(38,96,240) 14.6%, rgb(69,35,235) 85.4%)";

// ── KPI 카드 ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accentColor }: {
  label: string; value: string; sub: string; accentColor: string;
}) {
  return (
    <div className="flex-1 min-w-0 bg-[#151d36] rounded-[14px] shadow-[0px_3px_12px_rgba(0,0,0,0.18)] overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="px-[18px] py-[18px]">
        <p className="text-[12px] font-medium text-[#647dae] mb-2">{label}</p>
        <p className="text-[28px] font-bold text-white leading-none mb-2">{value}</p>
        <p className="text-[11px] text-[#647dae]">{sub}</p>
      </div>
    </div>
  );
}

// ── 대시보드 ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const pathname = usePathname();
  const [tab, setTab] = useState<EventTab>("전체 종합");
  const d = DATA[tab];

  return (
    <div className="flex min-h-screen bg-[#0d1226]">

      {/* ── 사이드바 ── */}
      <aside className="w-[220px] shrink-0 bg-[#11182f] relative">
        {/* 좌측 그라디언트 바 */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundImage: "linear-gradient(180deg, #2660f0 0%, #4523eb 100%)" }} />

        {/* 로고 */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[13px] font-extrabold text-white shrink-0"
            style={{ backgroundImage: GRAD }}>
            ET
          </div>
          <div>
            <p className="text-[13px] font-bold text-white leading-tight">EDEN Ticket</p>
            <p className="text-[10px] text-[#647dae]">관리자</p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="mx-5 h-px bg-[#243354] mb-1" />

        {/* 메뉴 */}
        <nav className="px-3 pt-2">
          {MENU.map((m) => {
            const isActive = pathname === m.href;
            return (
              <Link key={m.href} href={m.href}
                className={cn(
                  "block px-3 py-2.5 rounded-[10px] text-[13px] mb-0.5 transition-colors",
                  isActive ? "font-semibold text-white" : "text-[#647dae] hover:bg-white/5"
                )}
                style={isActive ? { backgroundColor: "rgba(38,96,240,0.2)" } : {}}>
                {m.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── 메인 ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* 탑바 */}
        <div className="bg-[#11182f] px-7 pt-5 pb-0">
          <h1 className="text-[20px] font-bold text-white mb-1">대시보드</h1>
          <p className="text-[11px] text-[#647dae] mb-3">
            이벤트를 선택하면 해당 행사 데이터를 확인할 수 있습니다
          </p>
          {/* 이벤트 탭 */}
          <div className="flex gap-2 pb-0">
            {EVENT_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("h-8 px-4 rounded-[8px] text-[12px] font-medium transition-all shrink-0",
                  t === tab ? "text-white" : "bg-[#151d36] text-[#647dae] hover:bg-[#1a2540]")}
                style={t === tab ? { backgroundImage: "linear-gradient(-6deg, rgb(38,96,240) 13.4%, rgb(69,35,235) 86.6%)" } : {}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-7 pt-5 pb-8 space-y-5">
          {/* KPI 카드 4개 */}
          <div className="flex gap-5">
            <KpiCard label="총 예약"         value={d.kpi.total}      sub="전체 누적"         accentColor="#2660f0" />
            <KpiCard label="오늘 체크인"     value={d.kpi.checkin}    sub={d.kpi.checkinSub} accentColor="#0eb077" />
            <KpiCard label="진행 중 이벤트"  value={d.kpi.active}     sub="현재 활성"         accentColor="#ed9208" />
            <KpiCard label="미방문율"        value={d.kpi.absentRate} sub="예약 대비 미방문"   accentColor="#db3838" />
          </div>

          {/* 하단 패널 */}
          <div className="flex gap-5">

            {/* 예약 테이블 */}
            <div className="flex-1 min-w-0 bg-[#151d36] rounded-[14px] shadow-[0px_3px_12px_rgba(0,0,0,0.18)] overflow-hidden">
              <div className="flex items-center justify-between px-[22px] py-[22px]">
                <span className="text-[15px] font-semibold text-white">최근 예약 현황</span>
                <Link href="/admin/reservations" className="text-[11px] font-medium text-[#6b91e5]">
                  전체보기 →
                </Link>
              </div>

              {/* 헤더 행 */}
              <div className="bg-[#0d1326] px-[22px] py-[10px] grid"
                style={{ gridTemplateColumns: "1fr 1.1fr 1.4fr 80px" }}>
                {["예약자","동호수","이벤트","방문"].map((col) => (
                  <span key={col} className="text-[11px] font-semibold text-[#5470a3]">{col}</span>
                ))}
              </div>

              {/* 데이터 행 */}
              {d.rows.map((row, i) => (
                <div key={i}
                  className="px-[22px] py-0 grid items-center"
                  style={{
                    gridTemplateColumns: "1fr 1.1fr 1.4fr 80px",
                    height: 48,
                    backgroundColor: i % 2 === 0 ? "#0f162a" : "transparent",
                    borderTop: "1px solid rgba(255,255,255,0.03)",
                  }}>
                  <span className="text-[13px] font-medium text-white">{row.name}</span>
                  <span className="text-[12px] text-[#94add6]">{row.unit}</span>
                  <span className="text-[12px] text-[#8099c7]">{row.event}</span>
                  <span
                    className="inline-flex items-center justify-center text-[11px] font-semibold rounded-[5px] w-fit h-[22px] px-2"
                    style={row.visited
                      ? { backgroundColor:"#e5f7f0", color:"#0eb077" }
                      : { backgroundColor:"#fee7e7", color:"#db3838" }}>
                    {row.visited ? "방문" : "미방문"}
                  </span>
                </div>
              ))}
            </div>

            {/* 이벤트별 현황 */}
            <div className="w-[356px] shrink-0 bg-[#151d36] rounded-[14px] shadow-[0px_3px_12px_rgba(0,0,0,0.18)] overflow-hidden">
              <div className="px-5 pt-[22px] pb-5">
                <p className="text-[15px] font-semibold text-white mb-4">이벤트별 예약 현황</p>

                <div className="space-y-3">
                  {d.events.map((ev) => {
                    const vPct = Math.round(ev.visited / ev.total * 100);
                    const aCount = ev.total - ev.visited;
                    const aPct = 100 - vPct;
                    const barW = Math.round(300 * vPct / 100);

                    return (
                      <div key={ev.name} className="bg-[#131a32] rounded-[10px] p-3">
                        <p className="text-[13px] font-semibold text-white mb-1">{ev.name}</p>
                        <p className="text-[11px] text-[#647dae] mb-3">총 {ev.total}명</p>
                        {/* 프로그레스 바 */}
                        <div className="h-2 bg-[#1a2645] rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${vPct}%`,
                              backgroundImage: "linear-gradient(90deg, #2660f0 0%, #4523eb 100%)",
                            }}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[11px] font-medium text-[#0eb077]">
                            방문 {ev.visited} ({vPct}%)
                          </span>
                          <span className="text-[11px] font-medium text-[#db3838]">
                            미방문 {aCount} ({aPct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
