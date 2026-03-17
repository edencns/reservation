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
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15 px-6 lg:px-40 py-4">
      <div className="flex items-center gap-4 text-primary">
        <h2 className="font-headline text-lg font-bold leading-tight tracking-tight">Move-In Fair</h2>
      </div>

      <div className="flex flex-1 justify-end gap-8 items-center">
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="text-on-surface text-sm font-medium hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => navigate('/events')}
          className="hidden md:flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary text-on-primary text-sm font-bold shadow-lg hover:bg-primary-container transition-all"
        >
          예약하기
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high transition md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 border-t border-outline-variant/15 bg-surface/95 backdrop-blur-xl px-6 py-4 space-y-1 md:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-container-low"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { navigate('/events'); setOpen(false); }}
            className="mt-2 w-full rounded-lg bg-primary py-3 text-sm font-bold text-on-primary transition hover:bg-primary-container"
          >
            예약하기
          </button>
        </div>
      )}
    </header>
  );
}
