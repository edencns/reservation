import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { Download } from 'lucide-react';

export default function Settlement() {
  const { reservations, events } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const key = `${year}-${String(month).padStart(2, '0')}`;
  const monthRes = reservations.filter(r => r.date.startsWith(key));
  const confirmed = monthRes.filter(r => r.status === 'confirmed');
  const cancelled = monthRes.filter(r => r.status === 'cancelled');
  const totalVisitors = confirmed.reduce((s, r) => s + r.attendeeCount, 0);

  const summaryCards = [
    { label: '예약 건수', value: confirmed.length + '건', sub: `취소 ${cancelled.length}건`, color: '#667EEA' },
    { label: '방문 인원', value: totalVisitors + '명', sub: '확정 기준', color: '#7EC8C8' },
    { label: '일 평균 방문', value: confirmed.length > 0 ? Math.round(totalVisitors / new Set(confirmed.map(r => r.date)).size) + '명' : '0명', sub: '방문일 기준', color: '#F4A261' },
    { label: '취소율', value: monthRes.length > 0 ? Math.round((cancelled.length / monthRes.length) * 100) + '%' : '0%', sub: '전체 대비', color: '#E76F51' },
  ];

  // Per-event breakdown for the month
  const eventBreakdown = events.map(e => {
    const eRes = confirmed.filter(r => r.eventId === e.id);
    return {
      title: e.title,
      count: eRes.length,
      visitors: eRes.reduce((s, r) => s + r.attendeeCount, 0),
    };
  }).filter(e => e.count > 0).sort((a, b) => b.visitors - a.visitors);

  // Daily breakdown
  const dailyMap: Record<string, { count: number; visitors: number }> = {};
  confirmed.forEach(r => {
    if (!dailyMap[r.date]) dailyMap[r.date] = { count: 0, visitors: 0 };
    dailyMap[r.date].count += 1;
    dailyMap[r.date].visitors += r.attendeeCount;
  });
  const dailyEntries = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="font-bold text-gray-800">방문 현황</h2>
        <div className="flex gap-2 items-center ml-auto">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}월</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
            <p className="font-extrabold text-gray-800 text-xl">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Event breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">행사별 방문 현황</h3>
          {eventBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">해당 월 데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {eventBreakdown.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{e.count}건 예약</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#667EEA' }}>{e.visitors}명</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">일별 방문 현황</h3>
          {dailyEntries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">해당 월 데이터 없음</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dailyEntries.map(([date, s]) => (
                <div key={date} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{formatDate(date)}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full"
                      style={{
                        width: `${(s.visitors / Math.max(...dailyEntries.map(([, v]) => v.visitors), 1)) * 100}%`,
                        backgroundColor: '#667EEA',
                      }} />
                  </div>
                  <span className="text-xs font-bold shrink-0" style={{ color: '#667EEA' }}>{s.visitors}명</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-700">상세 예약 내역</h3>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <Download size={15} /> 다운로드
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['방문일', '시간', '행사명', '예약자', '방문 인원', '상태'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthRes.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">해당 월 예약 없음</td></tr>
              ) : monthRes.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${r.status === 'cancelled' ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: '#667EEA' }}>{r.time}</td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <p className="font-medium text-gray-800 truncate">{r.eventTitle}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{r.customer.name}</p>
                    <p className="text-xs text-gray-400">{r.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-700">{r.attendeeCount}명</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>
                      {r.status === 'confirmed' ? '확정' : '취소'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
