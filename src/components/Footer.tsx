import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  const { companyInfo } = useApp();

  return (
    <footer style={{ backgroundColor: '#E0D6F9' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700">{companyInfo.name || '회사명 미입력'}</p>
          {companyInfo.address && <p>{companyInfo.address}</p>}
          {companyInfo.email && <p>{companyInfo.email}</p>}
        </div>
        <div className="border-t border-purple-200 mt-6 pt-4 text-xs text-gray-400">
          © 2026 {companyInfo.name || 'ReserveTicket'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
