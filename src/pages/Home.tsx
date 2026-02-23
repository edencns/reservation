import { useNavigate } from 'react-router-dom';
import { ChevronRight, Ticket, Phone, FileText, Users } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 4rem)' }}>

      {/* Hero */}
      <section
        className="flex-1 flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #91ADC2 0%, #7a97ae 50%, #6b8a9f 100%)' }}
      >
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            모델하우스·분양사무소<br />
            <span style={{ color: '#FFDAB9' }}>방문 예약</span>을 스마트하게
          </h1>
          <p className="text-base md:text-lg text-blue-100 mb-10">
            시간대별 정원 제한으로 방문자 혼잡을 방지하고<br className="hidden md:block" />
            QR 코드 티켓으로 현장 운영을 효율화하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/events')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#FFDAB9', color: '#5a7a8a' }}
            >
              예약 목록 보기 <ChevronRight className="inline" size={20} />
            </button>
            <button
              onClick={() => navigate('/my-tickets')}
              className="px-8 py-4 rounded-xl font-bold text-lg bg-white/20 text-white hover:bg-white/30 transition-all border border-white/40"
            >
              내 예약 확인
            </button>
          </div>
        </div>
      </section>

      {/* Company info */}
      <section style={{ backgroundColor: '#FFDAB9' }} className="px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-6">

            {/* Brand */}
            <div className="md:max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <Ticket size={22} style={{ color: '#91ADC2' }} />
                <span className="font-bold text-lg" style={{ color: '#91ADC2' }}>ReserveTicket</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                모델하우스·분양사무소 방문 예약을 온라인으로<br className="hidden md:block" />
                간편하게 접수하고 관리하세요.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12 text-sm text-gray-600">
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 mb-3">서비스</p>
                <div className="flex items-center gap-1.5"><Users size={13} className="text-gray-400" /><span>방문 예약</span></div>
                <div className="flex items-center gap-1.5"><FileText size={13} className="text-gray-400" /><span>내 예약 확인</span></div>
                <div className="flex items-center gap-1.5"><FileText size={13} className="text-gray-400" /><span>예약 취소</span></div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 mb-3">고객지원</p>
                <div className="flex items-center gap-1.5"><FileText size={13} className="text-gray-400" /><span>이용약관</span></div>
                <div className="flex items-center gap-1.5"><FileText size={13} className="text-gray-400" /><span>개인정보처리방침</span></div>
                <div className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /><span>고객센터: 02-0000-0000</span></div>
              </div>
            </div>
          </div>

          <div className="border-t border-orange-200 pt-5 text-xs text-gray-500">
            © 2026 ReserveTicket. All rights reserved.
          </div>
        </div>
      </section>

    </div>
  );
}
