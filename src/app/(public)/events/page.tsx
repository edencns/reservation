"use client";

import Link from "next/link";
import { useState } from "react";

const ALL_EVENTS = [
  {
    id: 1, slug: "hillstate-gwanggyo",
    title: "힐스테이트 광교 입주 박람회",
    date: "2025.04.12 ~ 04.13", place: "광교 A동 커뮤니티센터",
    count: "284명 예약", badge: "모집중", bc: "#0eb077", bL: "#e5f7f0",
  },
  {
    id: 2, slug: "raemian-onebailly",
    title: "래미안 원베일리 입주 박람회",
    date: "2025.04.19 ~ 04.20", place: "반포 B동 주민홀",
    count: "197명 예약", badge: "모집중", bc: "#2660f0", bL: "#ebefff",
  },
  {
    id: 3, slug: "dieh-bangbae",
    title: "디에이치 방배 입주 박람회",
    date: "2025.04.26 ~ 04.27", place: "방배 커뮤니티센터",
    count: "91명 예약", badge: "곧 시작", bc: "#ed9208", bL: "#fef3e3",
  },
  {
    id: 4, slug: "acro-riverhime",
    title: "아크로 리버하임 입주 박람회",
    date: "2025.05.03", place: "서초 커뮤니티홀",
    count: "준비중", badge: "곧 시작", bc: "#ed9208", bL: "#fef3e3",
  },
];

const TABS = ["전체", "모집중", "곧 시작", "종료"] as const;
type Tab = (typeof TABS)[number];

const GRAD = "linear-gradient(120deg, #2660f0 0%, #4523eb 100%)";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("전체");

  const filtered =
    activeTab === "전체"
      ? ALL_EVENTS
      : ALL_EVENTS.filter((e) => e.badge === activeTab);

  return (
    <div className="min-h-screen bg-[#f4f5f8]">
      <div className="mx-auto max-w-[1280px] px-10 py-10">
        {/* 헤딩 */}
        <h1 className="mb-1.5 text-[26px] font-bold text-[#0e1427]">이벤트 목록</h1>
        <p className="mb-6 text-[14px] text-[#6b7283]">참여하실 박람회를 선택해 주세요</p>

        {/* 필터 탭 */}
        <div className="mb-6 flex gap-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex h-[34px] min-w-[88px] items-center justify-center rounded-[8px] text-[13px] transition-all"
              style={
                activeTab === tab
                  ? { background: GRAD, color: "#fff", fontWeight: 600 }
                  : { background: "#eff0f4", color: "#4f576a", fontWeight: 400 }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 리스트 */}
        <div className="flex flex-col gap-3">
          {filtered.map((ev) => (
            <div
              key={ev.id}
              className="relative flex items-center rounded-[12px] bg-white overflow-hidden"
              style={{ boxShadow: "0px 3px 12px rgba(0,0,0,0.05)", minHeight: 94 }}
            >
              {/* 왼쪽 컬러 스트라이프 */}
              <div
                className="absolute left-0 top-0 h-full w-1 rounded-l-[12px]"
                style={{ background: ev.bc }}
              />

              <div className="flex flex-1 items-center px-6 pl-8">
                <div className="flex-1">
                  <p className="mb-2 text-[16px] font-semibold text-[#0e1427]">{ev.title}</p>
                  <p className="mb-2 text-[12px] text-[#6b7283]">
                    {ev.date} · {ev.place}
                  </p>
                  <span
                    className="inline-block rounded-[5px] px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: ev.bL, color: ev.bc }}
                  >
                    {ev.badge}
                  </span>
                </div>

                <p className="mx-10 min-w-[80px] text-right text-[13px] font-medium text-[#4f576a]">
                  {ev.count}
                </p>

                <Link
                  href={`/e/${ev.slug}/reserve`}
                  className="flex h-[44px] min-w-[102px] items-center justify-center rounded-[10px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: GRAD }}
                >
                  선택
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[14px] text-[#b2b6bf]">
              해당하는 이벤트가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
