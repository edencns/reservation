import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Ticket } from 'lucide-react';

const navLinks = [
  { to: '/events', label: '이벤트' },
  { to: '/my-tickets', label: '내 티켓' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: '#91ADC2' }}>
          <Ticket size={28} style={{ color: '#91ADC2' }} />
          <span>ReserveTicket</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-[#91ADC2]'
                  : 'text-gray-600 hover:text-[#91ADC2]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#91ADC2' }}
          >
            관리자
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="py-2 font-medium text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="py-2 font-medium text-center rounded-lg text-white"
            style={{ backgroundColor: '#91ADC2' }}
            onClick={() => setMenuOpen(false)}
          >
            관리자
          </Link>
        </div>
      )}
    </header>
  );
}
