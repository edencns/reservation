import type { Metadata } from "next";

export const metadata: Metadata = { title: "계약서 관리" };

export default function AdminContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">계약서 관리</h1>
        <p className="mt-1 text-sm text-slate-500">계약서 업로드, OCR 분석, 서명 관리</p>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
        <p className="text-sm">계약서 관리는 Step 5에서 구현됩니다.</p>
      </div>
    </div>
  );
}
