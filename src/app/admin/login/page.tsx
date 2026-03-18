import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = { title: "관리자 로그인" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/40">
            <Ticket size={26} strokeWidth={2.5} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">ReserveTicket</h1>
            <p className="text-sm text-slate-400">관리자 패널</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-8 shadow-xl backdrop-blur-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-white">로그인</h2>
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          ReserveTicket &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
