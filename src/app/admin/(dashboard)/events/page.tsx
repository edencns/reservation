import type { Metadata } from "next";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "이벤트 관리" };

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">이벤트 관리</h1>
          <p className="mt-1 text-sm text-slate-500">이벤트 생성, 수정, 삭제</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={16} />
          새 이벤트
        </button>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
        <p className="text-sm">이벤트 목록은 Step 4에서 구현됩니다.</p>
      </div>
    </div>
  );
}
