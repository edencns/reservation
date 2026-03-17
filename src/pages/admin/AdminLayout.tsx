import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ClipboardList, BarChart2, Wallet, LogOut, Ticket, Menu, X, Building2, Store, FileText } from 'lucide-react';
import { isAdminLoggedIn, adminLogout } from '../../utils/storage';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: '대시보드' },
  { to: '/admin/events', icon: <CalendarDays size={18} />, label: '이벤트 관리' },
  { to: '/admin/reservations', icon: <ClipboardList size={18} />, label: '예약 관리' },
  { to: '/admin/statistics', icon: <BarChart2 size={18} />, label: '통계' },
  { to: '/admin/settlement', icon: <Wallet size={18} />, label: '방문 현황' },
  { to: '/admin/vendors', icon: <Store size={18} />, label: '입점 업체 관리' },
  { to: '/admin/contracts', icon: <FileText size={18} />, label: '계약 관리' },
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
    adminLogout().then(() => navigate('/admin'));
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-60 bg-surface-container-high border-r border-outline-variant/15 flex flex-col h-screen sticky top-0 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-outline-variant/15">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary">
              <Ticket size={20} />
            </div>
            <div>
              <span className="font-headline font-bold text-on-surface text-lg block leading-tight">관리자 패널</span>
              <p className="text-on-surface-variant text-xs">ReserveTicket Admin</p>
            </div>
          </div>
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
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container rounded-xl'
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium text-sm transition-all"
          >
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/15 px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-container"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="font-headline font-bold text-on-surface">
            {navItems.find(n => n.to === location.pathname)?.label ?? '관리자'}
          </h1>
          <Link to="/" className="ml-auto text-xs text-on-surface-variant hover:text-on-surface">사이트 보기 →</Link>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
