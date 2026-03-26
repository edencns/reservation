"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href:"/events",     label:"이벤트" },
  { href:"/my-tickets", label:"예약 조회" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-[0px_1px_10px_rgba(0,0,0,0.06)]">
      <div className="w-full max-w-screen-xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8 lg:px-16">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[13px] font-extrabold text-white shrink-0"
            style={{ backgroundImage:"linear-gradient(-45deg, rgb(38,96,240) 14.6%, rgb(69,35,235) 85.4%)" }}>
            ET
          </span>
          <span className="text-[16px] font-bold text-[#0e1427]">EDEN Ticket</span>
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden sm:flex items-center gap-6">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={cn("text-[14px] transition-colors",
                pathname === n.href ? "font-semibold text-[#2660f0]" : "text-[#6b7283] hover:text-[#0e1427]")}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* 모바일 토글 */}
        <button className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[#6b7283] hover:bg-[#f4f5f8]"
          onClick={() => setOpen(v => !v)}>
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="sm:hidden border-t border-[#eff0f4] bg-white px-4 pb-4 pt-2">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={cn("block rounded-lg px-3 py-2.5 text-[14px]",
                pathname === n.href ? "font-semibold text-[#2660f0]" : "text-[#6b7283]")}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
