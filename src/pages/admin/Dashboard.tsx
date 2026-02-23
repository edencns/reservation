import { useApp } from '../../context/AppContext';
import { Ticket, CalendarDays, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

export default function Dashboard() {
  const { events, reservations } = useApp();
  const navigate = useNavigate();

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const today = now.toISOString().split('T')[0];

  const confirmed = reservations.filter(r => r.status === 'confirmed');
  const thisMonthRes = confirmed.filter(r => r.createdAt.startsWith(thisMonth));
  const todayRes = confirmed.filter(r => r.date === today);
  const totalVisitors = confirmed.reduce((s, r) => s + r.attendeeCount, 0);

  const stats = [
    { label: '총 예약', value: confirmed.length + '건', icon: <Ticket size={22} />, color: '#667EEA' },
    { label: '이번 달 예약', value: thisMonthRes.length + '건', icon: <CalendarDays size={22} />, color: '#7EC8C8' },
    { label: '오늘 방문 예약', value: todayRes.length + '건', icon: <Clock size={22} />, color: '#F4A261' },
    { label: '총 방문 인원', value: totalVisitors + '명', icon: <Users size={22} />, color: '#E76F51' },
  ];

  const recentRes = [...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const activeEvents = events.filter(e => e.status === 'active');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="font-extrabold text-gray-800 text-lg leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's reservations */}
      {todayRes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">
            오늘 방문 예약
            <span className="ml-2 text-sm font-normal text-gray-500">({formatDate(today)})</span>
          </h2>
          <div className="space-y-2">
            {todayRes.sort((a, b) => a.time.localeCompare(b.time)).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="text-sm font-bold w-12 shrink-0" style={{ color: '#667EEA' }}>{r.time}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{r.eventTitle}</p>
                  <p className="text-xs text-gray-400">{r.customer.name} · {r.customer.phone}</p>
                </div>
                <span className="text-xs font-bold shrink-0" style={{ color: '#667EEA' }}>{r.attendeeCount}명</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">최근 예약</h2>
            <button onClick={() => navigate('/admin/reservations')}
              className="text-xs font-medium hover:underline" style={{ color: '#667EEA' }}>
              전체 보기
            </button>
          </div>
          {recentRes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">예약 내역이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {recentRes.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: r.status === 'confirmed' ? '#667EEA' : '#ccc' }}>
                    {r.customer.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{r.eventTitle}</p>
                    <p className="text-xs text-gray-400">{r.customer.name} · {r.date} {r.time}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" style={{ color: '#667EEA' }}>{r.attendeeCount}명</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      r.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.status === 'confirmed' ? '확정' : '취소'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active events */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">진행 중 행사</h2>
            <button onClick={() => navigate('/admin/events')}
              className="text-xs font-medium hover:underline" style={{ color: '#667EEA' }}>
              전체 보기
            </button>
          </div>
          {activeEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">진행 중인 행사가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {activeEvents.map(e => {
                const eRes = confirmed.filter(r => r.eventId === e.id);
                const eVisitors = eRes.reduce((s, r) => s + r.attendeeCount, 0);
                return (
                  <div key={e.id} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold text-gray-700 flex-1 truncate pr-2">{e.title}</p>
                      <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full shrink-0">오픈</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{e.venue}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-400">{e.dates.length}일 운영</p>
                      <p className="text-xs font-semibold" style={{ color: '#667EEA' }}>
                        예약 {eRes.length}건 · {eVisitors}명
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
