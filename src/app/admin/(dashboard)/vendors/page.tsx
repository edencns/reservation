import type { Metadata } from "next";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "참가업체 관리" };

export default function AdminVendorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">참가업체 관리</h1>
          <p className="mt-1 text-sm text-slate-500">업체 정보, 계약서, OCR 분석</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={16} />
          업체 등록
        </button>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
        <p className="text-sm">업체 관리는 Step 4/5에서 구현됩니다.</p>
      </div>
    </div>
  );
}
