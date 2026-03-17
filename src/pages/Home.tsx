import { ArrowRight, Building, ShieldCheck, Truck, HandCoins, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

const services = [
  {
    icon: <Building size={32} className="text-blue-600" />,
    title: '인테리어 코디네이션',
    description: '프리미엄 마감재와 최고의 디자이너를 박람회 특가로 만나보세요. 입주민 전용 특별 할인 혜택을 제공합니다.',
    highlight: false,
  },
  {
    icon: <HandCoins size={32} className="text-white" />,
    title: '금융 컨설팅',
    description: '신규 분양 입주를 위한 전략적 모기지 및 보험 설계. 최적의 금융 플랜을 제안해 드립니다.',
    highlight: true,
  },
  {
    icon: <ShieldCheck size={32} className="text-blue-600" />,
    title: '스마트 보안·홈네트워크',
    description: '스마트홈 통합 솔루션으로 안전하고 편리한 생활환경을 구성하세요.',
    highlight: false,
  },
  {
    icon: <Truck size={32} className="text-blue-600" />,
    title: '이사 서비스',
    description: '전문 이사 업체와 연계한 원스톱 이삿짐 운반 서비스를 제공합니다.',
    highlight: false,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { events } = useApp();

  const activeEvents = events.filter(e => e.status === 'active');
  const heroEvent = activeEvents[0];

  const getTimeRange = (event: (typeof events)[0]) => {
    if (event.startTime || event.endTime) {
      return `${event.startTime ?? ''} ~ ${event.endTime ?? ''}`.trim();
    }
    const slots = event.timeSlots ?? [];
    if (slots.length === 0) return '시간 미지정';
    const first = slots[0]?.time;
    const last = slots[slots.length - 1]?.time;
    if (!first || first === '시간 미지정') return '시간 미지정';
    return first === last ? first : `${first} ~ ${last}`;
  };

  return (
    <div className="bg-white text-gray-800">

      {/* ── Hero ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              프리미엄 입주 박람회
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight text-gray-900">
              새로운 시작을 위한<br />특별한 입주 경험
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              인테리어, 금융, 보안, 이사까지 — 입주에 필요한 모든 것을 한 곳에서.
              전문 업체와의 독점 파트너십으로 최상의 조건을 제공합니다.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
              <button
                onClick={() => navigate('/events')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                박람회 예약하기 <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/my-tickets')}
                className="px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                내 예약 확인
              </button>
            </div>
          </div>

          {/* Hero image / event card */}
          <div className="relative">
            {heroEvent?.imageUrl ? (
              <img
                src={heroEvent.imageUrl}
                alt={heroEvent.title}
                className="rounded-2xl shadow-2xl w-full object-cover aspect-video"
              />
            ) : (
              <div className="rounded-2xl shadow-2xl w-full aspect-video bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Building size={80} className="text-blue-300" />
              </div>
            )}
            {heroEvent && (
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                <p className="font-bold text-gray-900 text-sm truncate">{heroEvent.title}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <MapPin size={11} />
                  <span className="truncate">{heroEvent.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 서비스 혜택 ── */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">입주민 혜택</h2>
          <p className="text-center mt-2 text-gray-500">박람회 참가자만을 위한 독점 서비스를 경험해 보세요.</p>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className={`p-7 rounded-2xl shadow-md transition-shadow hover:shadow-xl flex flex-col items-start ${
                  service.highlight ? 'bg-blue-600 text-white' : 'bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl mb-4 ${service.highlight ? 'bg-blue-500' : 'bg-blue-50'}`}>
                  {service.icon}
                </div>
                <h3 className={`text-lg font-bold ${service.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {service.title}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed flex-grow ${service.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                  {service.description}
                </p>
                <button
                  onClick={() => navigate('/events')}
                  className={`mt-5 text-sm font-semibold flex items-center gap-1.5 ${
                    service.highlight ? 'text-white hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'
                  } transition-colors`}
                >
                  자세히 보기 <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 박람회 일정 ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">진행 중인 박람회</h2>

        {activeEvents.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-medium">현재 진행 중인 박람회가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeEvents.map((event) => {
              const startDate = event.dates[0] ? formatDate(event.dates[0]) : '';
              const endDate = event.dates.length > 1 ? formatDate(event.dates[event.dates.length - 1]) : '';
              const timeRange = getTimeRange(event);
              return (
                <button
                  key={event.id}
                  onClick={() => navigate(`/e/${event.slug}`)}
                  className="w-full flex items-center gap-5 bg-gray-50 hover:bg-blue-50 p-6 rounded-xl transition-colors text-left group"
                >
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg truncate">{event.title}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={13} />{event.address}</span>
                      {timeRange !== '시간 미지정' && (
                        <span className="flex items-center gap-1"><Clock size={13} />{timeRange}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{startDate}{endDate && ` ~ ${endDate}`}</p>
                  </div>
                  <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/events')}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            전체 박람회 보기
          </button>
        </div>
      </div>
    </div>
  );
}
