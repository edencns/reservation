import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu, X, Ticket } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { getEventBySlug } = useApp();

  // 관리자 페이지에서는 헤더 숨김
  if (location.pathname.startsWith('/admin')) return null;

  // 슬러그 기반 이벤트 페이지: 최소화된 헤더
  const isEventPage = location.pathname.startsWith('/e/');
  const eventSlug = slug ?? location.pathname.split('/e/')[1]?.split('/')[0];
  const event = isEventPage && eventSlug ? getEventBySlug(eventSlug) : null;

  if (isEventPage) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: '#667EEA' }}>
            <Ticket size={22} />
            <span className="font-bold text-sm">ReserveTicket</span>
          </div>
          {event && (
            <Link
              to={`/e/${event.slug}/ticket`}
              className="text-sm font-medium hover:underline"
              style={{ color: '#667EEA' }}
            >
              내 예약 확인
            </Link>
          )}
        </div>
      </header>
    );
  }

  // 일반 공개 페이지 (홈 등)
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: '#667EEA' }}>
          <Ticket size={28} />
          <span>ReserveTicket</span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#667EEA' }}
          >
            관리자 로그인
          </button>
        </div>
        <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3">
          <button
            onClick={() => { navigate('/admin'); setMenuOpen(false); }}
            className="w-full py-2.5 rounded-lg text-white font-medium text-center"
            style={{ backgroundColor: '#667EEA' }}
          >
            관리자 로그인
          </button>
        </div>
      )}
    </header>
  );
}
