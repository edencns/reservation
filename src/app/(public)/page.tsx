"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── 이벤트 데이터 ── */
const EVENTS = [
  {
    id: "1",
    line1: "힐스테이트 광교",
    line2: "입주 박람회",
    date: "2025.04.12 ~ 13",
    place: "광교 A동 커뮤니티센터",
    badge: "모집중",
    badgeBg: "#e5f7f0",
    badgeColor: "#0eb077",
    barColor: "#0eb077",
    pct: 76,
    slug: "hilstate-gwanggyo",
  },
  {
    id: "2",
    line1: "래미안 원베일리",
    line2: "입주 박람회",
    date: "2025.04.19 ~ 20",
    place: "반포 B동 주민홀",
    badge: "모집중",
    badgeBg: "#ebefff",
    badgeColor: "#2660f0",
    barColor: "#2660f0",
    pct: 51,
    slug: "raemian-onebailey",
  },
  {
    id: "3",
    line1: "디에이치 방배",
    line2: "입주 박람회",
    date: "2025.04.26 ~ 27",
    place: "방배 커뮤니티센터",
    badge: "곧 시작",
    badgeBg: "#fef3e3",
    badgeColor: "#ed9208",
    barColor: "#ed9208",
    pct: 23,
    slug: "dh-bangbae",
  },
  {
    id: "4",
    line1: "아크로 리버하임",
    line2: "입주 박람회",
    date: "2025.05.03",
    place: "서초 커뮤니티홀",
    badge: "곧 시작",
    badgeBg: "#fef3e3",
    badgeColor: "#ed9208",
    barColor: "#ed9208",
    pct: 10,
    slug: "acro-riverheim",
  },
  {
    id: "5",
    line1: "자이 더파크",
    line2: "입주 박람회",
    date: "2025.05.10",
    place: "잠실 문화센터",
    badge: "모집중",
    badgeBg: "#e5f7f0",
    badgeColor: "#0eb077",
    barColor: "#0eb077",
    pct: 38,
    slug: "xi-thepark",
  },
];

const GRAD =
  "linear-gradient(-5.5deg, rgb(38,96,240) 13.4%, rgb(69,35,235) 86.6%)";

/* ── 이벤트 카드 ── */
function EventCard({ ev }: { ev: (typeof EVENTS)[0] }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0px_6px_22px_rgba(0,0,0,0.07)] w-[316px] shrink-0 overflow-hidden">
      {/* 상단 컬러 바 */}
      <div className="h-1 w-full" style={{ backgroundColor: ev.barColor }} />

      <div className="px-5 pt-4 pb-5">
        {/* 배지 */}
        <div
          className="inline-block px-[6px] py-[4px] rounded-[5px] text-[10px] font-semibold mb-3"
          style={{ backgroundColor: ev.badgeBg, color: ev.badgeColor }}
        >
          {ev.badge}
        </div>

        {/* 타이틀 2줄 */}
        <div className="text-[15px] font-bold text-[#0e1427] leading-[22px] mb-[30px]">
          <p>{ev.line1}</p>
          <p>{ev.line2}</p>
        </div>

        {/* 일시 / 장소 */}
        <p className="text-[12px] text-[#6b7283] mb-[3px]">{ev.date}</p>
        <p className="text-[12px] text-[#6b7283]">{ev.place}</p>

        {/* 구분선 */}
        <div className="h-px bg-[#eff0f4] my-4" />

        {/* 예약 버튼 */}
        <Link
          href={`/e/${ev.slug}`}
          className="flex items-center justify-center w-full h-[46px] rounded-[10px] text-[14px] font-semibold text-white"
          style={{ backgroundImage: GRAD }}
        >
          예약하기
        </Link>

        {/* 예약률 바 */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 bg-[#eff0f4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${ev.pct}%`,
                backgroundImage: GRAD,
              }}
            />
          </div>
          <span className="text-[11px] text-[#b2b6bf] shrink-0">
            예약률 {ev.pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── 홈페이지 ── */
export default function HomePage() {
  const [page, setPage] = useState(0);
  const maxPage = EVENTS.length - 3;

  return (
    <div className="min-h-screen bg-[#f4f5f8]">
      {/* ── 히어로 ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(-28.4deg, rgb(10,15,50) 13.4%, rgb(28,12,75) 86.6%)",
        }}
      >
        {/* 장식 블러 원 */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -20,
            right: "20%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(69,62,216,0.28)",
            filter: "blur(80px)",
          }}
        />

        {/* 콘텐츠 — Figma 기준 left:192 = pl-48 */}
        <div className="relative max-w-[1280px] mx-auto pl-48 pr-8 pt-16 pb-12">
          {/* 플랫폼 배지 */}
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full px-4 h-7 mb-6">
            <span className="text-[11px] font-medium text-[#ccdefa]">
              아파트 입주 박람회 예약 플랫폼
            </span>
          </div>

          {/* 타이틀 */}
          <div className="mb-5">
            <p className="text-[50px] font-bold text-white leading-[68px]">
              스마트한 입주 박람회
            </p>
            <p className="text-[50px] font-bold text-white leading-[68px]">
              방문 예약 서비스
            </p>
          </div>

          {/* 서브타이틀 */}
          <p className="text-[16px] text-[#b8ccf5] mb-10 max-w-[640px]">
            간편하게 사전 예약하고, 당일 빠르게 입장하세요.
          </p>

          {/* CTA 버튼 */}
          <div className="flex items-center gap-4 mb-10">
            <Link
              href="/events"
              className="flex items-center justify-center w-48 h-[50px] rounded-xl text-[15px] font-semibold text-white shadow-[0px_6px_20px_rgba(0,0,0,0.3)]"
              style={{
                backgroundImage:
                  "linear-gradient(-8.6deg, rgb(38,96,240) 13.4%, rgb(69,35,235) 86.6%)",
              }}
            >
              이벤트 둘러보기
            </Link>
            <Link
              href="/my-tickets"
              className="flex items-center justify-center w-40 h-[50px] rounded-xl text-[15px] font-medium text-white border border-[#bfd1fa] opacity-75"
            >
              예약 조회
            </Link>
          </div>

          {/* 통계 바 — Figma: w:480 h:44 */}
          <div className="flex items-center bg-white/10 rounded-[10px] h-11 w-[480px]">
            <div className="flex flex-col justify-center pl-5 w-[152px]">
              <span className="text-[15px] font-bold text-white leading-none">
                3,240건
              </span>
              <span className="text-[11px] text-[#9eb8e5] mt-1">
                누적 예약
              </span>
            </div>
            <div className="w-px h-[18px] bg-[#8ca6d9]" />
            <div className="flex flex-col justify-center pl-[26px] w-[132px]">
              <span className="text-[15px] font-bold text-white leading-none">
                98%
              </span>
              <span className="text-[11px] text-[#9eb8e5] mt-1">만족도</span>
            </div>
            <div className="w-px h-[18px] bg-[#8ca6d9]" />
            <div className="flex flex-col justify-center pl-[26px]">
              <span className="text-[15px] font-bold text-white leading-none">
                12개
              </span>
              <span className="text-[11px] text-[#9eb8e5] mt-1">
                진행 이벤트
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 이벤트 섹션 ── */}
      <section className="max-w-[1280px] mx-auto pl-48 pr-8 pt-10 pb-16">
        {/* 섹션 헤더 */}
        <h2 className="text-[22px] font-bold text-[#0e1427] mb-1">
          진행 중인 이벤트
        </h2>
        <p className="text-[14px] text-[#6b7283] mb-6">
          예약 가능한 박람회를 선택하세요
        </p>

        {/* 캐러셀 */}
        <div className="flex items-center gap-4">
          {/* 이전 버튼 */}
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="shrink-0 w-10 h-10 rounded-full bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center text-[#4f576a] disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {/* 카드 뷰포트 */}
          <div className="flex-1 overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(calc(-${page * (316 + 20)}px))`,
              }}
            >
              {EVENTS.map((ev) => (
                <EventCard key={ev.id} ev={ev} />
              ))}
            </div>
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-[0px_4px_12px_rgba(0,0,0,0.2)] disabled:opacity-30 hover:opacity-90 transition-opacity"
            style={{
              backgroundImage:
                "linear-gradient(-45deg, rgb(38,96,240) 14.6%, rgb(69,35,235) 85.4%)",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 인디케이터 점 */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxPage + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn("h-2 rounded-full transition-all duration-200")}
              style={
                i === page
                  ? {
                      width: 20,
                      backgroundImage:
                        "linear-gradient(90deg, rgb(38,96,240) 0%, rgb(69,35,235) 100%)",
                    }
                  : { width: 8, backgroundColor: "#e1e2e9" }
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
