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
    <header className="fixed top-0 w-full z-50 glass-nav border-b" style={{ borderColor: 'rgba(194,199,209,0.2)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl" style={{ color: 'var(--primary)', fontFamily: 'Manrope, sans-serif' }}>
          <Ticket size={24} style={{ color: 'var(--primary-container)' }} />
          <span>ReserveTicket</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--on-surface-variant)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <button
            onClick={() => navigate('/events')}
            className="hero-gradient text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            예약하기
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md transition-colors"
          style={{ color: 'var(--on-surface-variant)' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-6 py-3 space-y-1" style={{ background: 'var(--surface-container-lowest)', borderColor: 'var(--outline-variant)' }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'var(--on-surface)' }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => { navigate('/events'); setMenuOpen(false); }}
            className="hero-gradient w-full mt-2 py-3 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            예약하기
          </button>
        </div>
      )}
    </header>
  );
}
