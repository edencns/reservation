"use client";

import Link from "next/link";
import { useState } from "react";

const EVENTS = [
  {
    id: 1,
    slug: "hillstate-gwanggyo",
    title: "힐스테이트 광교\n입주 박람회",
    date: "2025.04.12 ~ 13",
    place: "광교 A동 커뮤니티센터",
    badge: "모집중",
    badgeColor: "#0eb077",
    badgeBg: "#e5f7f0",
    accentColor: "#0eb077",
    pct: 76,
  },
  {
    id: 2,
    slug: "raemian-onebailly",
    title: "래미안 원베일리\n입주 박람회",
    date: "2025.04.19 ~ 20",
    place: "반포 B동 주민홀",
    badge: "모집중",
    badgeColor: "#2660f0",
    badgeBg: "#ebefff",
    accentColor: "#2660f0",
    pct: 51,
  },
  {
    id: 3,
    slug: "dieh-bangbae",
    title: "디에이치 방배\n입주 박람회",
    date: "2025.04.26 ~ 27",
    place: "방배 커뮤니티센터",
    badge: "곧 시작",
    badgeColor: "#ed9208",
    badgeBg: "#fef3e3",
    accentColor: "#ed9208",
    pct: 23,
  },
  {
    id: 4,
    slug: "acro-riverhime",
    title: "아크로 리버하임\n입주 박람회",
    date: "2025.05.03 ~ 04",
    place: "서초 커뮤니티홀",
    badge: "곧 시작",
    badgeColor: "#ed9208",
    badgeBg: "#fef3e3",
    accentColor: "#ed9208",
    pct: 8,
  },
  {
    id: 5,
    slug: "eg-hangang",
    title: "e편한세상 한강\n입주 박람회",
    date: "2025.05.10",
    place: "마포 커뮤니티센터",
    badge: "곧 시작",
    badgeColor: "#ed9208",
    badgeBg: "#fef3e3",
    accentColor: "#ed9208",
    pct: 3,
  },
];

const GRAD = "linear-gradient(-5.5deg, #2660f0 13%, #4523eb 87%)";
const CARD_W = 316;
const CARD_GAP = 26;

export default function HomePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const visibleCount = 3;

  const prev = () => setActiveIdx((i) => Math.max(0, i - 1));
  const next = () => setActiveIdx((i) => Math.min(EVENTS.length - visibleCount, i + 1));

  const visible = EVENTS.slice(activeIdx, activeIdx + visibleCount);

  return (
    <div className="bg-[#f4f5f8]">
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(-28deg, #0a0f32 13%, #1c0c4b 87%)",
          minHeight: 400,
        }}
      >
        {/* 배경 장식 원 */}
        <div
          className="pointer-events-none absolute"
          style={{
            right: -20,
            top: -20,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(69,50,225,0.22)",
            filter: "blur(100px)",
          }}
        />

        <div className="relative mx-auto max-w-[1280px] px-10 pb-10 pt-16">
          {/* 태그 배지 */}
          <div
            className="mb-6 inline-block rounded-[14px] px-4 py-1.5 text-[11px] font-medium"
            style={{ background: "rgba(255,255,255,0.12)", color: "#ccdefa" }}
          >
            아파트 입주 박람회 예약 플랫폼
          </div>

          {/* 타이틀 */}
          <h1
            className="mb-5 font-bold text-white"
            style={{ fontSize: 50, lineHeight: "68px" }}
          >
            스마트한 입주 박람회<br />방문 예약 서비스
          </h1>

          <p className="mb-8 text-[16px] text-[#b8ccf5]">
            간편하게 사전 예약하고, 당일 빠르게 입장하세요.
          </p>

          {/* CTA */}
          <div className="mb-8 flex items-center gap-4">
            <Link
              href="/events"
              className="flex h-[50px] items-center justify-center rounded-[12px] px-8 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: GRAD, boxShadow: "0px 6px 20px rgba(0,0,0,0.3)", minWidth: 192 }}
            >
              이벤트 둘러보기
            </Link>
            <Link
              href="/my-tickets"
              className="flex h-[50px] items-center justify-center rounded-[12px] border border-[#bfd1fa] px-8 text-[15px] font-medium text-white opacity-75 transition-opacity hover:opacity-100"
              style={{ minWidth: 160 }}
            >
              예약 조회
            </Link>
          </div>

          {/* 통계 */}
          <div
            className="flex items-center gap-0 rounded-[10px] px-5"
            style={{ background: "rgba(255,255,255,0.10)", height: 44, width: 480 }}
          >
            {[
              { v: "3,240건", l: "누적 예약" },
              { v: "98%", l: "만족도" },
              { v: "12개", l: "진행 이벤트" },
            ].map((s, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && (
                  <div className="mx-8 h-[18px] w-px" style={{ background: "#8ca6d9" }} />
                )}
                <div>
                  <p className="text-[15px] font-bold text-white">{s.v}</p>
                  <p className="text-[11px] text-[#9eb8e5]">{s.l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section className="mx-auto max-w-[1280px] px-10 py-10">
        <h2 className="mb-1.5 text-[22px] font-bold text-[#0e1427]">진행 중인 이벤트</h2>
        <p className="mb-6 text-[14px] text-[#6b7283]">예약 가능한 박람회를 선택하세요</p>

        {/* 캐러셀 */}
        <div className="relative flex items-center">
          {/* 이전 버튼 */}
          <button
            onClick={prev}
            disabled={activeIdx === 0}
            className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[20px] font-medium text-[#4f576a] transition-opacity disabled:opacity-30"
            style={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }}
          >
            ‹
          </button>

          {/* 카드 영역 */}
          <div className="flex gap-[26px] overflow-hidden">
            {visible.map((ev) => {
              const lines = ev.title.split("\n");
              return (
                <div
                  key={ev.id}
                  className="flex-shrink-0 rounded-[16px] bg-white"
                  style={{
                    width: CARD_W,
                    boxShadow: "0px 6px 22px rgba(0,0,0,0.07)",
                  }}
                >
                  {/* 상단 컬러 바 */}
                  <div
                    className="h-1 w-full rounded-t-[16px]"
                    style={{ background: ev.accentColor }}
                  />

                  <div className="p-5">
                    {/* 배지 */}
                    <div
                      className="mb-4 inline-block rounded-[5px] px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: ev.badgeBg, color: ev.badgeColor }}
                    >
                      {ev.badge}
                    </div>

                    {/* 제목 */}
                    <div
                      className="mb-3 font-bold text-[#0e1427]"
                      style={{ fontSize: 15, lineHeight: "22px" }}
                    >
                      {lines.map((l, i) => <p key={i}>{l}</p>)}
                    </div>

                    {/* 날짜·장소 */}
                    <p className="text-[12px] text-[#6b7283]">{ev.date}</p>
                    <p className="mb-4 text-[12px] text-[#6b7283]">{ev.place}</p>

                    {/* 구분선 */}
                    <div className="mb-4 h-px bg-[#eff0f4]" />

                    {/* 예약 버튼 */}
                    <Link
                      href={`/e/${ev.slug}/reserve`}
                      className="mb-2 flex h-[46px] w-full items-center justify-center rounded-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: GRAD }}
                    >
                      예약하기
                    </Link>

                    {/* 예약률 */}
                    <p className="mb-1.5 text-right text-[11px] text-[#b2b6bf]">
                      예약률 {ev.pct}%
                    </p>
                    <div className="h-1 w-full rounded-full bg-[#eff0f4]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${ev.pct}%`, background: GRAD }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 다음 버튼 */}
          <button
            onClick={next}
            disabled={activeIdx >= EVENTS.length - visibleCount}
            className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[20px] font-semibold text-white transition-opacity disabled:opacity-30"
            style={{
              background: activeIdx >= EVENTS.length - visibleCount ? "#e0e2e8" : GRAD,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            ›
          </button>
        </div>

        {/* 인디케이터 점 */}
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: EVENTS.length - visibleCount + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === activeIdx ? 20 : 8,
                background: i === activeIdx ? "#2660f0" : "#e0e2e8",
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
