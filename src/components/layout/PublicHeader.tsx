"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/events", label: "이벤트" },
  { href: "/my-tickets", label: "예약 조회" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0px_1px_10px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #2660f0 0%, #4523eb 100%)" }}
          >
            ET
          </span>
          <span className="text-[16px] font-bold text-[#0e1427]">EDEN Ticket</span>
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden items-center gap-6 sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "text-[14px] transition-colors",
                pathname === n.href
                  ? "font-semibold text-[#2660f0]"
                  : "font-normal text-[#6b7283] hover:text-[#0e1427]"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* 모바일 토글 */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7283] hover:bg-[#f4f5f8] sm:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="border-t border-[#eff0f4] bg-white px-6 pb-4 pt-2 sm:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-[14px]",
                pathname === n.href
                  ? "font-semibold text-[#2660f0]"
                  : "text-[#6b7283]"
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
