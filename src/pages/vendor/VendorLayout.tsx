import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { CalendarDays, FileText, LogOut, Store, Menu, X } from 'lucide-react';
import { getVendorSession, clearVendorSession, getManagedVendors } from '../../utils/storage';
import type { ManagedVendor } from '../../types';

const navItems = [
  { to: '/vendor/events', icon: <CalendarDays size={18} />, label: '이벤트 현황' },
  { to: '/vendor/contracts', icon: <FileText size={18} />, label: '계약 관리' },
];

export default function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [vendor, setVendor] = useState<ManagedVendor | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const sid = getVendorSession();
    if (!sid) { navigate('/admin'); return; }
    const found = getManagedVendors().find(v => v.id === sid);
    if (!found) { clearVendorSession(); navigate('/admin'); return; }
    setVendor(found);
  }, [navigate]);

  const handleLogout = () => {
    clearVendorSession();
    navigate('/admin');
  };

  if (!vendor) return null;

  const currentLabel = navItems.find(n => location.pathname.startsWith(n.to))?.label ?? '업체 포털';

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
            <Store size={22} className="text-white" />
            <span className="font-extrabold text-white text-base truncate">{vendor.name}</span>
          </div>
          <p className="text-blue-100 text-xs mt-1">{vendor.category} · 업체 포털</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive ? 'bg-white text-[#667EEA] shadow-sm' : 'text-white hover:bg-white/20'
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
          <h1 className="font-bold text-gray-800">{currentLabel}</h1>
          <span className="ml-auto text-xs text-gray-400">{vendor.name}</span>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet context={{ vendor }} />
        </main>
      </div>
    </div>
  );
}
