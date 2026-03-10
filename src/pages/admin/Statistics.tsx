import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportToExcel } from '../../utils/exportExcel';

export default function Statistics() {
  const { reservations, events } = useApp();

  const [eventFilter, setEventFilter] = useState('all');

  const baseReservations = useMemo(() => {
    const confirmed = reservations.filter(r => r.status === 'confirmed');
    return eventFilter === 'all' ? confirmed : confirmed.filter(r => r.eventId === eventFilter);
  }, [reservations, eventFilter]);

  // Monthly booking stats (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
      const monthRes = baseReservations.filter(r => r.createdAt.startsWith(key));
      return {
        label,
        shortLabel: `${d.getMonth() + 1}월`,
        count: monthRes.length,
        visitors: monthRes.reduce((s, r) => s + r.attendeeCount, 0),
      };
    });
  }, [baseReservations]);

  const maxCount = Math.max(...monthlyData.map(m => m.count), 1);
  const maxVisitors = Math.max(...monthlyData.map(m => m.visitors), 1);

  // Per-event stats
  const eventStats = useMemo(() => {
    const targetEvents = eventFilter === 'all' ? events : events.filter(e => e.id === eventFilter);
    return targetEvents.map(e => {
      const eRes = baseReservations.filter(r => r.eventId === e.id);
      return { title: e.title, count: eRes.length, visitors: eRes.reduce((s, r) => s + r.attendeeCount, 0) };
    }).sort((a, b) => b.visitors - a.visitors);
  }, [events, baseReservations, eventFilter]);

  // Time slot popularity
  const timeEntries = useMemo(() => {
    const timeStats: Record<string, { count: number; visitors: number }> = {};
    baseReservations.forEach(r => {
      if (!timeStats[r.time]) timeStats[r.time] = { count: 0, visitors: 0 };
      timeStats[r.time].count += 1;
      timeStats[r.time].visitors += r.attendeeCount;
    });
    return Object.entries(timeStats)
      .map(([time, s]) => ({ time, ...s }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [baseReservations]);

  const maxTimeVisitors = Math.max(...timeEntries.map(t => t.visitors), 1);

  const handleExport = () => {
    exportToExcel('통계', [
      {
        name: '월별 통계',
        data: monthlyData.map(m => ({
          '월': m.label,
          '예약 건수': m.count,
          '방문 인원': m.visitors,
        })),
      },
      {
        name: '행사별 통계',
        data: eventStats.map(e => ({
          '행사명': e.title,
          '예약 건수': e.count,
          '방문 인원': e.visitors,
        })),
      },
      {
        name: '시간대별 통계',
        data: timeEntries.map(t => ({
          '시간대': t.time,
          '예약 건수': t.count,
          '방문 인원': t.visitors,
        })),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">통계</h2>
        <div className="flex items-center gap-2">
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
          >
            <option value="all">전체 행사</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Download size={15} /> 엑셀
          </button>
        </div>
      </div>

      {/* Monthly reservations */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-5">월별 예약 건수</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.shortLabel} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-600">{m.count}</p>
              <div className="w-full rounded-t-lg"
                style={{ height: `${Math.max((m.count / maxCount) * 120, m.count > 0 ? 4 : 0)}px`, backgroundColor: '#667EEA' }} />
              <p className="text-xs text-gray-500">{m.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly visitors */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-5">월별 방문 인원</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.shortLabel} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-600">{m.visitors}</p>
              <div className="w-full rounded-t-lg border-2"
                style={{
                  height: `${Math.max((m.visitors / maxVisitors) * 120, m.visitors > 0 ? 4 : 0)}px`,
                  backgroundColor: '#E0D6F9',
                  borderColor: '#d6c4f4',
                }} />
              <p className="text-xs text-gray-500">{m.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Per-event stats */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">행사별 방문 현황</h3>
          {eventStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {eventStats.map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{e.title}</p>
                    <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full"
                        style={{
                          width: `${(e.visitors / Math.max(...eventStats.map(x => x.visitors), 1)) * 100}%`,
                          backgroundColor: '#667EEA',
                        }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#667EEA' }}>{e.visitors}명</p>
                    <p className="text-xs text-gray-400">{e.count}건</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time slot popularity */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">시간대별 방문 인원</h3>
          {timeEntries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {timeEntries.map(t => (
                <div key={t.time} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-12 shrink-0" style={{ color: '#667EEA' }}>{t.time}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className="h-3 rounded-full"
                      style={{
                        width: `${(t.visitors / maxTimeVisitors) * 100}%`,
                        backgroundColor: '#E0D6F9',
                        border: '1.5px solid #d6c4f4',
                      }} />
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-700">{t.visitors}명</span>
                    <span className="text-xs text-gray-400 ml-1">({t.count}건)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
