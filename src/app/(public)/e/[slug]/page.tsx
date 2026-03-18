import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Clock, ArrowRight, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Will fetch from DB in Step 2
  return { title: `이벤트 — ${slug}` };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  // Placeholder — will query DB in Step 2
  if (slug !== "sample-event-2025") {
    notFound();
  }

  const event = {
    slug,
    title: "2025 입주박람회 — 서울",
    description:
      "서울 최대 규모의 입주박람회입니다. 다양한 인테리어, 가전, 가구 업체들이 참가하여 특별 혜택을 제공합니다.",
    location: "서울 코엑스 A홀",
    startDate: "2025-08-01",
    endDate: "2025-08-03",
    timeSlots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    categories: ["인테리어", "가전", "가구", "욕실", "주방"],
    totalCapacity: 500,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/events" className="hover:text-blue-600">이벤트 목록</Link>
        <span>/</span>
        <span className="text-slate-700">{event.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                예약 가능
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {event.title}
            </h1>
            <p className="mt-3 leading-relaxed text-slate-600">{event.description}</p>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              {[
                { icon: CalendarDays, label: "기간", value: `${event.startDate} ~ ${event.endDate}` },
                { icon: MapPin, label: "장소", value: event.location },
                { icon: Clock, label: "운영 시간", value: "09:00 ~ 18:00" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <Icon size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
                  <div>
                    <span className="text-slate-500">{label}: </span>
                    <span className="text-slate-800">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Categories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
              <Tag size={16} className="text-slate-400" />
              참가 업종
            </h2>
            <div className="flex flex-wrap gap-2">
              {event.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar CTA */}
        <div className="space-y-4">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">이벤트 예약</p>
            <p className="font-bold text-slate-900 text-lg mb-4">{event.title}</p>

            <Link
              href={`/e/${slug}/reserve`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              지금 예약하기
              <ArrowRight size={16} />
            </Link>

            <Link
              href={`/e/${slug}/ticket`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              예약 조회
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
