"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MENU = [
  { label: "대시보드",   href: "/admin" },
  { label: "이벤트 관리", href: "/admin/events" },
  { label: "예약 관리",  href: "/admin/reservations" },
  { label: "통계",       href: "/admin/statistics" },
  { label: "정산",       href: "/admin/settlement" },
  { label: "업체 관리",  href: "/admin/vendors" },
  { label: "계약 관리",  href: "/admin/contracts" },
  { label: "회사 정보",  href: "/admin/company" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="relative flex w-[220px] shrink-0 flex-col"
      style={{ backgroundColor: "#111830" }}
    >
      {/* 왼쪽 그라디언트 선 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: "linear-gradient(180deg, #2660f0 0%, #4523eb 100%)" }}
      />

      {/* 로고 */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #2660f0 0%, #4523eb 100%)" }}
        >
          ET
        </div>
        <div>
          <p className="text-[13px] font-bold text-white">EDEN Ticket</p>
          <p className="text-[10px]" style={{ color: "#6480ae" }}>관리자</p>
        </div>
      </div>

      {/* 구분선 */}
      <div className="mx-5 h-px" style={{ backgroundColor: "#232f4d" }} />

      {/* 메뉴 */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4">
        {MENU.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                isActive
                  ? "font-semibold text-white"
                  : "font-normal hover:bg-white/5"
              )}
              style={
                isActive
                  ? { backgroundColor: "rgba(38,96,240,0.20)", color: "white" }
                  : { color: "#6480ae" }
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
