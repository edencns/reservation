import type { Metadata } from "next";
import { CalendarDays, ClipboardList, Store, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "대시보드" };

const stats = [
  { label: "진행중 이벤트", value: "—", icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
  { label: "총 예약", value: "—", icon: ClipboardList, color: "text-indigo-600 bg-indigo-50" },
  { label: "참가 업체", value: "—", icon: Store, color: "text-emerald-600 bg-emerald-50" },
  { label: "이번달 방문", value: "—", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">ReserveTicket 관리 현황</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <span className={`rounded-xl p-2.5 ${color}`}>
                <Icon size={20} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder — charts built in Step 4 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {["최근 예약", "이벤트 현황"].map((title) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">{title}</h2>
            <div className="flex h-48 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
              Step 4에서 구현됩니다
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
