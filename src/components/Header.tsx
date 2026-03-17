import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/events', label: '박람회 목록' },
  { href: '/my-tickets', label: '내 예약' },
  { href: '/admin', label: '관리자' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#f5f7fa]/90 backdrop-blur-md border-b border-white/60">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 lg:px-10">

        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-[22px] font-light tracking-[-0.04em] text-[#0d2754]"
          >
            ReserveTicket
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm text-[#4a5a72] transition-colors hover:text-[#0d2754]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/events')}
            className="hidden rounded-xl bg-[#0a3d78] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 md:block"
          >
            예약하기
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d0daea] bg-[#eaeff7] text-[#0d2754] transition hover:bg-[#dce4f0] md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#dce4f0] bg-[#edf1f7] px-6 py-4 space-y-1 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm text-[#17315d] transition hover:bg-white"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { navigate('/events'); setOpen(false); }}
            className="mt-2 w-full rounded-xl bg-[#0a3d78] py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            예약하기
          </button>
        </div>
      )}
    </header>
  );
}
