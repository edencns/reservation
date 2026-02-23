import { Ticket } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer style={{ backgroundColor: '#FFDAB9' }} className="mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Ticket size={22} style={{ color: '#91ADC2' }} />
              <span className="font-bold text-lg" style={{ color: '#91ADC2' }}>ReserveTicket</span>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              전시, 공연, 콘서트, 컨퍼런스 등 다양한 이벤트를 간편하게 예약하세요.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-700 mb-2">서비스</p>
              <p>이벤트 예약</p>
              <p>내 티켓 조회</p>
              <p>예약 취소</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-2">고객지원</p>
              <p>이용약관</p>
              <p>개인정보처리방침</p>
              <p>고객센터: 02-0000-0000</p>
            </div>
          </div>
        </div>
        <div className="border-t border-orange-200 mt-8 pt-6 text-xs text-gray-500">
          © 2026 ReserveTicket. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
