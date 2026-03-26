"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white"
      style={{ boxShadow: "0px 1px 10px 0px rgba(0,0,0,0.06)" }}
    >
      <div className="flex h-16 items-center justify-between px-10 mx-auto max-w-[1280px]">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-white text-[13px] font-extrabold"
            style={{
              background: "linear-gradient(-45deg, #2660f0 14.645%, #4523eb 85.355%)",
            }}
          >
            ET
          </div>
          <span className="text-[16px] font-bold text-[#0e1427]">EDEN Ticket</span>
        </Link>

        {/* 네비 */}
        <nav className="flex items-center gap-8">
          <Link
            href="/events"
            className="text-[14px] transition-colors"
            style={{ color: pathname.startsWith("/events") ? "#2660f0" : "#6b7283", fontWeight: pathname.startsWith("/events") ? 600 : 400 }}
          >
            이벤트
          </Link>
          <Link
            href="/my-tickets"
            className="text-[14px] transition-colors"
            style={{ color: pathname === "/my-tickets" ? "#2660f0" : "#6b7283", fontWeight: pathname === "/my-tickets" ? 600 : 400 }}
          >
            예약 조회
          </Link>
        </nav>
      </div>
    </header>
  );
}
