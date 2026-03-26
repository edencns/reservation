"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function MyTicketsPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f5f8]">
      <div className="max-w-[640px] mx-auto px-6 pt-16 pb-16">
        <h1 className="text-[26px] font-bold text-[#0e1427] mb-2">예약 조회</h1>
        <p className="text-[14px] text-[#6b7283] mb-8">연락처 또는 예약번호로 예약 내역을 확인하세요.</p>

        {/* 검색 */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b2b6bf]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setSearched(true)}
              placeholder="010-0000-0000 또는 예약번호"
              className="w-full h-[48px] pl-10 pr-4 rounded-xl border border-[#e1e2e9] bg-white text-[14px] text-[#0e1427] placeholder:text-[#b2b6bf] outline-none focus:border-[#2660f0] transition-colors"
            />
          </div>
          <button
            onClick={() => setSearched(true)}
            className="h-[48px] px-6 rounded-xl text-[14px] font-semibold text-white shrink-0"
            style={{ background:"linear-gradient(120deg,#2660f0 0%,#4523eb 100%)" }}>
            조회하기
          </button>
        </div>

        {/* 결과 없음 */}
        {searched && (
          <div className="mt-8 bg-white rounded-2xl p-12 text-center shadow-[0px_3px_12px_rgba(0,0,0,0.05)]">
            <p className="text-[15px] font-semibold text-[#0e1427] mb-2">예약 내역이 없습니다</p>
            <p className="text-[13px] text-[#6b7283]">입력하신 정보로 조회된 예약이 없어요.<br />연락처 또는 예약번호를 다시 확인해 주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
