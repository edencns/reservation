import { useState, useMemo } from 'react';
import { Download, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { exportToExcel } from '../../utils/exportExcel';
import type { Reservation } from '../../types';

interface DetailModal {
  label: string;
  rows: Reservation[];
}

export default function Statistics() {
  const { reservations, events } = useApp();

  const [eventFilter, setEventFilter] = useState('all');
  const [detail, setDetail] = useState<DetailModal | null>(null);

  const baseReservations = useMemo(() => {
    const confirmed = reservations.filter(r => r.status === 'confirmed');
    return eventFilter === 'all' ? confirmed : confirmed.filter(r => r.eventId === eventFilter);
  }, [reservations, eventFilter]);

  // Monthly stats (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
      const shortLabel = `${d.getMonth() + 1}월`;
      const monthRes = baseReservations.filter(r => r.createdAt.startsWith(key));
      return { label, shortLabel, key, count: monthRes.length, visitors: monthRes.reduce((s, r) => s + r.attendeeCount, 0), rows: monthRes };
    });
  }, [baseReservations]);

  const maxCount = Math.max(...monthlyData.map(m => m.count), 1);
  const maxVisitors = Math.max(...monthlyData.map(m => m.visitors), 1);

  // Per-event stats
  const eventStats = useMemo(() => {
    const targetEvents = eventFilter === 'all' ? events : events.filter(e => e.id === eventFilter);
    return targetEvents.map(e => {
      const eRes = baseReservations.filter(r => r.eventId === e.id);
      return { id: e.id, title: e.title, count: eRes.length, visitors: eRes.reduce((s, r) => s + r.attendeeCount, 0), rows: eRes };
    }).sort((a, b) => b.visitors - a.visitors);
  }, [events, baseReservations, eventFilter]);

  // Time slot stats
  const timeEntries = useMemo(() => {
    const timeStats: Record<string, { count: number; visitors: number; rows: Reservation[] }> = {};
    baseReservations.forEach(r => {
      if (!timeStats[r.time]) timeStats[r.time] = { count: 0, visitors: 0, rows: [] };
      timeStats[r.time].count += 1;
      timeStats[r.time].visitors += r.attendeeCount;
      timeStats[r.time].rows.push(r);
    });
    return Object.entries(timeStats)
      .map(([time, s]) => ({ time, ...s }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [baseReservations]);

  const maxTimeVisitors = Math.max(...timeEntries.map(t => t.visitors), 1);

  const handleExport = () => {
    exportToExcel('통계', [
      { name: '월별 통계', data: monthlyData.map(m => ({ '월': m.label, '예약 건수': m.count, '방문 인원': m.visitors })) },
      { name: '행사별 통계', data: eventStats.map(e => ({ '행사명': e.title, '예약 건수': e.count, '방문 인원': e.visitors })) },
      { name: '시간대별 통계', data: timeEntries.map(t => ({ '시간대': t.time, '예약 건수': t.count, '방문 인원': t.visitors })) },
    ]);
  };

  const openDetail = (label: string, rows: Reservation[]) => {
    setDetail({ label, rows: [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
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
          <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Download size={15} /> 엑셀
          </button>
        </div>
      </div>

      {/* 월별 예약 건수 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-5">월별 예약 건수</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.shortLabel} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-600">{m.count}</p>
              <button
                className="w-full rounded-t-lg transition-opacity hover:opacity-75"
                style={{ height: `${Math.max((m.count / maxCount) * 120, m.count > 0 ? 4 : 0)}px`, backgroundColor: '#667EEA' }}
                onClick={() => m.count > 0 && openDetail(`${m.label} 예약 목록`, m.rows)}
                title={m.count > 0 ? '클릭하여 상세 보기' : ''}
              />
              <p className="text-xs text-gray-500">{m.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 월별 방문 인원 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-5">월별 방문 인원</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.shortLabel} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-600">{m.visitors}</p>
              <button
                className="w-full rounded-t-lg border-2 transition-opacity hover:opacity-75"
                style={{
                  height: `${Math.max((m.visitors / maxVisitors) * 120, m.visitors > 0 ? 4 : 0)}px`,
                  backgroundColor: '#E0D6F9', borderColor: '#d6c4f4',
                }}
                onClick={() => m.visitors > 0 && openDetail(`${m.label} 방문 목록`, m.rows)}
                title={m.visitors > 0 ? '클릭하여 상세 보기' : ''}
              />
              <p className="text-xs text-gray-500">{m.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* 행사별 방문 현황 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-1">행사별 방문 현황</h3>
          <p className="text-xs text-gray-400 mb-4">행사명 또는 인원을 클릭하면 방문자 목록을 볼 수 있습니다</p>
          {eventStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {eventStats.map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <button
                      className="text-sm font-semibold text-gray-700 truncate w-full text-left hover:text-[#667EEA] transition-colors"
                      onClick={() => e.count > 0 && openDetail(`${e.title} — 전체 목록`, e.rows)}
                    >
                      {e.title}
                    </button>
                    <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${(e.visitors / Math.max(...eventStats.map(x => x.visitors), 1)) * 100}%`, backgroundColor: '#667EEA' }} />
                    </div>
                  </div>
                  <button
                    className="text-right shrink-0 hover:opacity-70 transition-opacity"
                    onClick={() => e.count > 0 && openDetail(`${e.title} — 방문자 목록`, e.rows)}
                  >
                    <p className="text-sm font-bold" style={{ color: '#667EEA' }}>{e.visitors}명</p>
                    <p className="text-xs text-gray-400">{e.count}건</p>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 시간대별 방문 인원 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-1">시간대별 방문 인원</h3>
          <p className="text-xs text-gray-400 mb-4">시간대를 클릭하면 방문자 목록을 볼 수 있습니다</p>
          {timeEntries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {timeEntries.map(t => (
                <button
                  key={t.time}
                  className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl px-2 py-1 -mx-2 transition-colors"
                  onClick={() => openDetail(`${t.time} 시간대 방문자 목록`, t.rows)}
                >
                  <span className="text-sm font-bold w-12 shrink-0 text-left" style={{ color: '#667EEA' }}>{t.time}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className="h-3 rounded-full" style={{ width: `${(t.visitors / maxTimeVisitors) * 100}%`, backgroundColor: '#E0D6F9', border: '1.5px solid #d6c4f4' }} />
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-700">{t.visitors}명</span>
                    <span className="text-xs text-gray-400 ml-1">({t.count}건)</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 상세 방문자 모달 */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-sm">{detail.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">총 {detail.rows.length}건 · {detail.rows.reduce((s, r) => s + r.attendeeCount, 0)}명</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            {/* 목록 */}
            <div className="overflow-y-auto flex-1">
              {detail.rows.length === 0 ? (
                <p className="text-center py-10 text-sm text-gray-400">내역이 없습니다</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: '#E0D6F9' }}>
                      {['예약자', '연락처', '방문일', '시간', '인원', '체크인'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-gray-700 text-xs whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {detail.rows.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium text-gray-800 text-xs">{r.customer.name || r.extraFields['name'] || '-'}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs">{r.customer.phone || r.extraFields['phone'] || '-'}</td>
                        <td className="px-3 py-2.5 text-gray-600 text-xs whitespace-nowrap">{formatDate(r.date)}</td>
                        <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">{r.time}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-xs" style={{ color: '#667EEA' }}>{r.attendeeCount}명</td>
                        <td className="px-3 py-2.5 text-xs">
                          {r.checkedIn
                            ? <span className="text-green-600 font-semibold">✓ 입장</span>
                            : <span className="text-gray-300">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-5 pb-4 pt-3 border-t border-gray-100 shrink-0">
              <button onClick={() => setDetail(null)} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#667EEA' }}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
