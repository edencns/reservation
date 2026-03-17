import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Ticket } from 'lucide-react';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/events', label: '박람회 목록' },
  { href: '/my-tickets', label: '내 예약' },
  { href: '/admin', label: '관리자' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50" style={{ background: '#f3f5f8', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-5 lg:px-10">

        {/* Logo + Nav */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="flex items-center gap-2"
            style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.04em', color: '#0d2754' }}
          >
            <Ticket size={20} style={{ color: '#0a4b8e' }} />
            ReserveTicket
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex" style={{ color: '#31435f' }}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="transition-colors hover:text-[#0d2754]"
                style={{ color: '#31435f' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/events')}
            className="hidden rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 md:block"
            style={{ background: '#0a3d78' }}
          >
            예약하기
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border md:hidden"
            style={{ borderColor: '#c8d4e4', background: '#e8edf3', color: '#0d2754' }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t px-6 py-4 space-y-1 md:hidden" style={{ background: '#edf1f5', borderColor: '#d8e0eb' }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm transition-colors hover:bg-white"
              style={{ color: '#17315d' }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => { navigate('/events'); setMenuOpen(false); }}
            className="mt-2 w-full rounded-xl py-3 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: '#0a3d78' }}
          >
            예약하기
          </button>
        </div>
      )}
    </header>
  );
}
