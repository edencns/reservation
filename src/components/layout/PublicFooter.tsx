import { Ticket } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white">
              <Ticket size={12} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-semibold">ReserveTicket</span>
          </div>
          <p className="text-center text-xs text-slate-400">
            입주박람회 사전예약 시스템 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
