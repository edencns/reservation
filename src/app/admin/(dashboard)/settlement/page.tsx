import type { Metadata } from "next";

export const metadata: Metadata = { title: "정산" };

export default function AdminSettlementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">정산</h1>
        <p className="mt-1 text-sm text-slate-500">이벤트별 정산 현황</p>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
        <p className="text-sm">정산 기능은 Step 4에서 구현됩니다.</p>
      </div>
    </div>
  );
}
