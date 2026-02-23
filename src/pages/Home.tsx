import { useNavigate } from 'react-router-dom';
import { ChevronRight, Ticket, Monitor, Smartphone, CreditCard, BarChart2, Users, CalendarCheck, QrCode, Bell, CheckCircle, Star } from 'lucide-react';

const features = [
  { icon: <Ticket size={28} />, title: '다양한 접수 대행', desc: '전시, 숙박, 콘서트, 박람회 등 모든 형태의 이벤트 예약 지원' },
  { icon: <Monitor size={28} />, title: '좌석 지정', desc: '도면화된 좌석에서 원하는 자리를 직접 선택' },
  { icon: <CalendarCheck size={28} />, title: '시간 지정', desc: '행사 진행 시간대별 또는 일 단위 접수 지정' },
  { icon: <Users size={28} />, title: '인원 제어', desc: '시간/일 단위로 입장객 수 제한 및 관리' },
  { icon: <CreditCard size={28} />, title: '다양한 결제수단', desc: '신용카드, 무통장입금, 휴대폰 결제 지원' },
  { icon: <Bell size={28} />, title: 'SMS·이메일 발송', desc: '예매 정보 자동 SMS·이메일 전송' },
  { icon: <CheckCircle size={28} />, title: '무료 접수', desc: '유료와 동일하게 무료 티켓도 편리하게 관리' },
  { icon: <QrCode size={28} />, title: '모바일 티켓 & 검표', desc: 'QR코드 기반 모바일 발권과 현장 검표' },
  { icon: <BarChart2 size={28} />, title: '정산 관리', desc: '판매·취소·수수료 내역 상세 조회' },
  { icon: <Smartphone size={28} />, title: '통계 관리', desc: '시간대별, 일별, 월별 판매 현황 리포트' },
];

const steps = [
  { num: '01', title: '이벤트 등록', desc: '관리자 패널에서 이벤트 정보, 좌석, 가격을 설정하고 예약을 오픈합니다.' },
  { num: '02', title: '온라인 예약 접수', desc: '관객이 원하는 날짜·시간·좌석을 선택하고 정보를 입력해 예약을 완료합니다.' },
  { num: '03', title: '현장 운영', desc: 'QR코드 모바일 티켓으로 간편하게 입장 검표하고 현장을 운영합니다.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative min-h-[520px] flex items-center"
        style={{ background: 'linear-gradient(135deg, #91ADC2 0%, #7a97ae 50%, #6b8a9f 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-24 text-center w-full">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ backgroundColor: 'rgba(255,218,185,0.25)', color: '#FFDAB9' }}
          >
            <Star size={14} /> 스마트 예약 시스템
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            간편하고 스마트한<br />
            <span style={{ color: '#FFDAB9' }}>온라인 예약</span> 플랫폼
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            전시·공연·콘서트·컨퍼런스 등 모든 이벤트의 예약부터 현장 운영까지<br className="hidden md:block" />
            하나의 플랫폼으로 완벽하게 관리하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/events')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#FFDAB9', color: '#5a7a8a' }}
            >
              이벤트 둘러보기 <ChevronRight className="inline" size={20} />
            </button>
            <button
              onClick={() => navigate('/my-tickets')}
              className="px-8 py-4 rounded-xl font-bold text-lg bg-white/20 text-white hover:bg-white/30 transition-all border border-white/40"
            >
              내 티켓 확인
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-50" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3">강력한 예약 기능</h2>
            <p className="text-gray-500">필요한 모든 기능을 하나의 플랫폼에서</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 text-white"
                  style={{ backgroundColor: '#91ADC2' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" style={{ backgroundColor: '#FFDAB9' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3">이용 방법</h2>
            <p className="text-gray-600">3단계로 쉽게 시작하세요</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm text-center relative">
                <div
                  className="text-4xl font-black mb-4 opacity-20"
                  style={{ color: '#91ADC2' }}
                >
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight
                    size={24}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 hidden md:block"
                    style={{ color: '#91ADC2' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">지금 바로 시작하세요</h2>
          <p className="text-gray-500 mb-8">다양한 이벤트를 간편하게 예약하고 모바일 티켓으로 스마트하게 입장하세요.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:opacity-90 shadow-md hover:scale-105"
            style={{ backgroundColor: '#91ADC2' }}
          >
            이벤트 예약하기
          </button>
        </div>
      </section>
    </div>
  );
}
