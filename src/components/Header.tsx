import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu, X, Ticket } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { adminLogout, isAdminLoggedIn, getVendorSession, clearVendorSession, getManagedVendors } from '../utils/storage';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { getEventBySlug } = useApp();
  const [adminLoggedIn, setAdminLoggedIn] = useState(isAdminLoggedIn());
  const [vendorLoggedIn, setVendorLoggedIn] = useState(!!getVendorSession());
  const [vendorName, setVendorName] = useState(() => {
    const sid = getVendorSession();
    return sid ? (getManagedVendors().find(v => v.id === sid)?.name ?? '') : '';
  });

  useEffect(() => {
    const refresh = () => {
      setAdminLoggedIn(isAdminLoggedIn());
      const sid = getVendorSession();
      setVendorLoggedIn(!!sid);
      setVendorName(sid ? (getManagedVendors().find(v => v.id === sid)?.name ?? '') : '');
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('rv_auth_change', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('rv_auth_change', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [location]);

  // 관리자/업체 페이지에서는 헤더 숨김
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/vendor')) return null;

  // 슬러그 기반 이벤트 페이지: 최소화된 헤더 (vendors 페이지는 일반 헤더 사용)
  const isEventPage = location.pathname.startsWith('/e/') && !location.pathname.includes('/vendors');
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

  const isEventDetailPage = location.pathname.startsWith('/events/');
  const isReservePage = location.pathname.startsWith('/reserve/');
  const lockBrandLink = isEventDetailPage || isReservePage;

  const handleAdminAction = () => {
    if (vendorLoggedIn) {
      clearVendorSession();
      setVendorLoggedIn(false);
      setVendorName('');
      return;
    }
    if (adminLoggedIn) {
      adminLogout();
      setAdminLoggedIn(false);
      return;
    }
    navigate('/admin');
  };

  // 일반 공개 페이지 (홈 등)
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {lockBrandLink ? (
          <div className="flex items-center gap-2 font-bold text-xl" style={{ color: '#667EEA' }}>
            <Ticket size={28} />
            <span>ReserveTicket</span>
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: '#667EEA' }}>
            <Ticket size={28} />
            <span>ReserveTicket</span>
          </Link>
        )}
        <div className="hidden md:flex items-center gap-4">
          {vendorLoggedIn && (
            <button
              onClick={() => navigate('/vendor/events')}
              className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#667EEA' }}
            >
              {vendorName} 포털
            </button>
          )}
          {adminLoggedIn && !vendorLoggedIn && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#667EEA' }}
            >
              관리자 페이지
            </button>
          )}
          <button
            onClick={handleAdminAction}
            className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#667EEA' }}
          >
            {vendorLoggedIn ? '로그아웃' : adminLoggedIn ? '관리자 로그아웃' : '관리자 로그인'}
          </button>
        </div>
        <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
          {vendorLoggedIn && (
            <button
              onClick={() => { navigate('/vendor/events'); setMenuOpen(false); }}
              className="w-full py-2.5 rounded-lg text-white font-medium text-center"
              style={{ backgroundColor: '#667EEA' }}
            >
              {vendorName} 포털
            </button>
          )}
          {adminLoggedIn && !vendorLoggedIn && (
            <button
              onClick={() => { navigate('/admin/dashboard'); setMenuOpen(false); }}
              className="w-full py-2.5 rounded-lg text-white font-medium text-center"
              style={{ backgroundColor: '#667EEA' }}
            >
              관리자 페이지
            </button>
          )}
          <button
            onClick={() => { handleAdminAction(); setMenuOpen(false); }}
            className="w-full py-2.5 rounded-lg text-white font-medium text-center"
            style={{ backgroundColor: '#667EEA' }}
          >
            {vendorLoggedIn ? '로그아웃' : adminLoggedIn ? '관리자 로그아웃' : '관리자 로그인'}
          </button>
        </div>
      )}
    </header>
  );
}
