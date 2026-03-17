import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/events', label: '예약' },
  { href: '/my-tickets', label: '내 예약' },
  { href: '/admin', label: '관리자' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/15 h-20 flex items-center px-8 md:px-20 justify-between">
      <div className="flex items-center gap-12">
        <span className="text-primary font-headline font-extrabold text-2xl tracking-tight">Move-In Fair</span>
        <div className="hidden md:flex gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/events')}
          className="hidden md:block bg-primary text-on-primary px-6 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
        >
          예약하기
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
        >
          <span className="material-symbols-outlined text-on-surface">{open ? 'close' : 'menu'}</span>
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 border-t border-outline-variant/15 bg-surface/95 backdrop-blur-xl px-8 py-4 space-y-1 md:hidden">
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
            className="mt-2 w-full rounded-lg bg-primary py-3 text-sm font-bold text-on-primary transition hover:opacity-90"
          >
            예약하기
          </button>
        </div>
      )}
    </nav>
  );
}
