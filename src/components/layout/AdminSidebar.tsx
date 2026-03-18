"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Ticket,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  BarChart3,
  Wallet,
  Store,
  FileSignature,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarDays },
  { href: "/admin/reservations", label: "예약 관리", icon: ClipboardList },
  { href: "/admin/statistics", label: "통계", icon: BarChart3 },
  { href: "/admin/settlement", label: "정산", icon: Wallet },
  { href: "/admin/vendors", label: "참가업체 관리", icon: Store },
  { href: "/admin/contracts", label: "계약서 관리", icon: FileSignature },
  { href: "/admin/company", label: "회사 정보", icon: Building2 },
];

function SidebarContent({
  pathname,
  onLinkClick,
}: {
  pathname: string;
  onLinkClick?: () => void;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-700/50 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Ticket size={16} strokeWidth={2.5} />
        </span>
        <div>
          <p className="text-sm font-bold text-white">ReserveTicket</p>
          <p className="text-[10px] text-slate-400">관리자 패널</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onLinkClick}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-900/30"
                      : "text-slate-400 hover:bg-slate-700/60 hover:text-white"
                  )}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <ChevronRight size={14} className="opacity-60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700/50 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-white"
        >
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 bg-slate-900 lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      {/* Mobile: top bar */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Ticket size={14} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold text-slate-900">ReserveTicket</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
          aria-label="메뉴"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-slate-900">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3.5 rounded-md p-1.5 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <SidebarContent
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
