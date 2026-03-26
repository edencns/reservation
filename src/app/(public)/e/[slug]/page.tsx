import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, ArrowRight, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// 정적 export를 위한 slug 목록
export async function generateStaticParams() {
  return [
    { slug: "hilstate-gwanggyo" },
    { slug: "raemian-onebailey" },
    { slug: "dh-bangbae" },
    { slug: "acro-riverheim" },
    { slug: "xi-thepark" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `이벤트 — ${slug}` };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const event = {
    slug,
    title: "힐스테이트 광교 입주 박람회",
    description:
      "아파트 입주 박람회에 방문 예약하세요. 인테리어, 가전, 금융 서비스 등 다양한 서비스를 한 자리에서 만나보세요.",
    location: "광교 A동 커뮤니티센터",
    startDate: "2025-04-12",
    endDate: "2025-04-13",
    timeSlots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"],
    categories: ["인테리어", "가전", "금융", "이사", "청소"],
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

          {/* 관심 서비스 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-900 flex items-center gap-2">
              <Tag size={16} className="text-slate-400" />
              제공 서비스
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
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(120deg, #2660f0 0%, #4523eb 100%)" }}
            >
              지금 예약하기
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
