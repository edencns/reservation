import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = { title: "이벤트 목록" };

// Placeholder — will be replaced with real DB data in Step 2
const mockEvents = [
  {
    slug: "sample-event-2025",
    title: "2025 입주박람회 — 서울",
    location: "서울 코엑스 A홀",
    startDate: "2025-08-01",
    endDate: "2025-08-03",
    timeSlots: "09:00 ~ 18:00",
    isActive: true,
  },
];

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">이벤트 목록</h1>
        <p className="mt-1 text-slate-500">예약 가능한 박람회를 확인하세요.</p>
      </div>

      {mockEvents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
          <CalendarDays size={40} strokeWidth={1.5} />
          <p className="text-sm">현재 진행 중인 이벤트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mockEvents.map((event) => (
            <article
              key={event.slug}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h2 className="font-semibold text-slate-900 leading-snug group-hover:text-blue-600">
                  {event.title}
                </h2>
                {event.isActive && (
                  <span className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    예약중
                  </span>
                )}
              </div>

              <div className="mb-5 space-y-1.5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="flex-shrink-0 text-slate-400" />
                  <span>
                    {event.startDate} ~ {event.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="flex-shrink-0 text-slate-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="flex-shrink-0 text-slate-400" />
                  <span>{event.timeSlots}</span>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <Link
                  href={`/e/${event.slug}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  상세 보기
                </Link>
                <Link
                  href={`/e/${event.slug}/reserve`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  예약하기
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
