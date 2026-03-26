"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const EVENTS = [
  { id:"1", title:"힐스테이트 광교 입주 박람회", date:"2025.04.12 ~ 04.13", place:"광교 A동 커뮤니티센터", count:"284명 예약", badge:"모집중", status:"open",  barColor:"#0eb077", badgeBg:"#e5f7f0", badgeText:"#0eb077", slug:"hilstate-gwanggyo" },
  { id:"2", title:"래미안 원베일리 입주 박람회",  date:"2025.04.19 ~ 04.20", place:"반포 B동 주민홀",       count:"197명 예약", badge:"모집중", status:"open",  barColor:"#2660f0", badgeBg:"#ebefff", badgeText:"#2660f0", slug:"raemian-onebailey" },
  { id:"3", title:"디에이치 방배 입주 박람회",    date:"2025.04.26 ~ 04.27", place:"방배 커뮤니티센터",     count:"91명 예약",  badge:"곧 시작",status:"soon",  barColor:"#ed9208", badgeBg:"#fef3e3", badgeText:"#ed9208", slug:"dh-bangbae" },
  { id:"4", title:"아크로 리버하임 입주 박람회",  date:"2025.05.03",          place:"서초 커뮤니티홀",       count:"준비중",     badge:"곧 시작",status:"soon",  barColor:"#ed9208", badgeBg:"#fef3e3", badgeText:"#ed9208", slug:"acro-riverheim" },
];

const TABS = ["전체","모집중","곧 시작","종료"] as const;
type Tab = typeof TABS[number];
const TAB_STATUS: Record<Tab, string|null> = { "전체":null,"모집중":"open","곧 시작":"soon","종료":"closed" };

export default function EventsPage() {
  const [tab, setTab] = useState<Tab>("전체");
  const filtered = EVENTS.filter(e => TAB_STATUS[tab] === null || e.status === TAB_STATUS[tab]);

  return (
    <div className="min-h-screen bg-[#f4f5f8]">
      <div className="max-w-[1280px] mx-auto px-[192px] pt-[96px] pb-16">

        <h1 className="text-[26px] font-bold text-[#0e1427] leading-normal mb-2">이벤트 목록</h1>
        <p className="text-[14px] text-[#6b7283] leading-normal mb-6">참여하실 박람회를 선택해 주세요</p>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("h-[34px] px-6 rounded-[8px] text-[13px] font-semibold transition-all", t === tab ? "text-white" : "bg-[#eff0f4] text-[#4f576a]")}
              style={t === tab ? { backgroundImage:"linear-gradient(-12.57deg, rgb(38,96,240) 13.4%, rgb(69,35,235) 86.6%)" } : {}}>
              {t}
            </button>
          ))}
        </div>

        {/* 리스트 */}
        <div className="flex flex-col gap-[16px]">
          {filtered.map(ev => (
            <div key={ev.id} className="relative bg-white h-[94px] rounded-[12px] shadow-[0px_3px_12px_0px_rgba(0,0,0,0.05)] overflow-hidden flex items-center">
              {/* 왼쪽 컬러 바 */}
              <div className="absolute left-0 top-0 w-[4px] h-full rounded-tl-[12px] rounded-bl-[12px]" style={{ backgroundColor: ev.barColor }} />

              {/* 본문 */}
              <div className="ml-[24px] flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-[#0e1427] leading-normal mb-1">{ev.title}</p>
                <p className="text-[12px] text-[#6b7283] leading-normal mb-2">{ev.date} · {ev.place}</p>
                <span className="inline-block px-[6px] py-[3px] rounded-[5px] text-[10px] font-semibold" style={{ backgroundColor: ev.badgeBg, color: ev.badgeText }}>
                  {ev.badge}
                </span>
              </div>

              {/* 예약수 */}
              <p className="text-[13px] font-medium text-[#4f576a] px-8 shrink-0">{ev.count}</p>

              {/* 선택 버튼 */}
              <div className="pr-[24px] shrink-0">
                <Link href={`/e/${ev.slug}`}
                  className="flex items-center justify-center w-[102px] h-[44px] rounded-[10px] text-[13px] font-semibold text-white"
                  style={{ backgroundImage:"linear-gradient(-13.99deg, rgb(38,96,240) 13.4%, rgb(69,35,235) 86.6%)" }}>
                  선택
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
