import type { Metadata } from "next";

export const metadata: Metadata = { title: "예약 관리" };

export default function AdminReservationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">예약 관리</h1>
        <p className="mt-1 text-sm text-slate-500">예약 내역 조회, 체크인, SMS 발송</p>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
        <p className="text-sm">예약 관리는 Step 4에서 구현됩니다.</p>
      </div>
    </div>
  );
}
