import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ClipboardList, BarChart2, Wallet, LogOut, Ticket, Menu, X, QrCode, Building2, Store } from 'lucide-react';
import { isAdminLoggedIn, adminLogout } from '../../utils/storage';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: '대시보드' },
  { to: '/admin/events', icon: <CalendarDays size={18} />, label: '이벤트 관리' },
  { to: '/admin/reservations', icon: <ClipboardList size={18} />, label: '예약 관리' },
  { to: '/admin/checkin', icon: <QrCode size={18} />, label: 'QR 체크인' },
  { to: '/admin/statistics', icon: <BarChart2 size={18} />, label: '통계' },
  { to: '/admin/settlement', icon: <Wallet size={18} />, label: '방문 현황' },
  { to: '/admin/vendors', icon: <Store size={18} />, label: '입점 업체 관리' },
  { to: '/admin/company', icon: <Building2 size={18} />, label: '회사 정보' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) navigate('/admin');
  }, [navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-60 flex flex-col shadow-xl transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ backgroundColor: '#667EEA' }}
      >
        <div className="p-5 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Ticket size={22} className="text-white" />
            <span className="font-extrabold text-white text-lg">관리자 패널</span>
          </div>
          <p className="text-blue-100 text-xs mt-1">ReserveTicket Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-white text-[#667EEA] shadow-sm'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/20 font-medium text-sm transition-all"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="font-bold text-gray-800">
            {navItems.find(n => n.to === location.pathname)?.label ?? '관리자'}
          </h1>
          <Link to="/" className="ml-auto text-xs text-gray-400 hover:text-gray-600">사이트 보기 →</Link>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
