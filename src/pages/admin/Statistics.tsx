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
  const [households, setHouseholds] = useState<Record<string, number>>({});

  const baseReservations = useMemo(() => {
    const confirmed = reservations.filter(r => r.status === 'confirmed');
    return eventFilter === 'all' ? confirmed : confirmed.filter(r => r.eventId === eventFilter);
  }, [reservations, eventFilter]);

  const checkedInReservations = useMemo(() => baseReservations.filter(r => r.checkedIn), [baseReservations]);

  // Monthly stats (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
      const shortLabel = `${d.getMonth() + 1}월`;
      const monthRes = baseReservations.filter(r => r.createdAt.startsWith(key));
      const monthCheckedIn = monthRes.filter(r => r.checkedIn);
      return {
        label, shortLabel, key,
        count: monthRes.length,
        visitors: monthCheckedIn.reduce((s, r) => s + r.attendeeCount, 0),
        rows: monthRes,
        checkedInRows: monthCheckedIn,
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
      const eCheckedIn = eRes.filter(r => r.checkedIn);
      const eCancelled = reservations.filter(r => r.eventId === e.id && r.status === 'cancelled');
      const cancelledCount = eCancelled.length;
      const total = eRes.length + cancelledCount;
      const visitedVisitors = eCheckedIn.reduce((s, r) => s + r.attendeeCount, 0);
      const totalVisitors = eRes.reduce((s, r) => s + r.attendeeCount, 0);
      const rate = eRes.length > 0 ? Math.round((eCheckedIn.length / eRes.length) * 100) : 0;
      return { id: e.id, title: e.title, count: eRes.length, visitedCount: eCheckedIn.length, visitedVisitors, totalVisitors, cancelledCount, total, rate, rows: eRes, checkedInRows: eCheckedIn };
    }).sort((a, b) => b.total - a.total);
  }, [events, baseReservations, reservations, eventFilter]);

  // Time slot stats (방문 인원 = checkedIn 기준)
  const timeEntries = useMemo(() => {
    const timeStats: Record<string, { count: number; visitors: number; rows: Reservation[] }> = {};
    checkedInReservations.forEach(r => {
      // checkedInAt(실제 체크인 시각) 기준 시간대, 없으면 예약 시간 fallback
      let slot = r.time !== '시간 미지정' ? r.time : '';
      if (r.checkedInAt) {
        const d = new Date(r.checkedInAt);
        const kstHour = String((d.getUTCHours() + 9) % 24).padStart(2, '0');
        slot = `${kstHour}:00`;
      }
      if (!slot) return;
      if (!timeStats[slot]) timeStats[slot] = { count: 0, visitors: 0, rows: [] };
      timeStats[slot].count += 1;
      timeStats[slot].visitors += r.attendeeCount;
      timeStats[slot].rows.push(r);
    });
    return Object.entries(timeStats)
      .map(([time, s]) => ({ time, ...s }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [checkedInReservations]);

  const maxTimeVisitors = Math.max(...timeEntries.map(t => t.visitors), 1);

  const handleExport = () => {
    exportToExcel('통계', [
      { name: '월별 통계', data: monthlyData.map(m => ({ '월': m.label, '예약 건수': m.count, '방문 인원': m.visitors })) },
      { name: '행사별 통계', data: eventStats.map(e => ({ '행사명': e.title, '총 예약건': e.count, '방문건': e.visitedCount, '취소건': e.cancelledCount, '방문 인원': e.visitedVisitors, '방문율(%)': e.rate })) },
      { name: '시간대별 통계', data: timeEntries.map(t => ({ '시간대': t.time, '예약 건수': t.count, '방문 인원': t.visitors })) },
    ]);
  };

  const openDetail = (label: string, rows: Reservation[]) => {
    setDetail({ label, rows: [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-on-surface">통계</h2>
        <div className="flex items-center gap-2">
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-3 py-2 border border-outline-variant rounded-xl text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">전체 행사</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container">
            <Download size={15} /> 엑셀
          </button>
        </div>
      </div>

      {/* 월별 예약 건수 */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5">
        <h3 className="font-bold text-on-surface mb-5">월별 예약 건수</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.shortLabel} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-on-surface-variant">{m.count}</p>
              <button
                className="w-full rounded-t-lg transition-opacity hover:opacity-75 bg-primary"
                style={{ height: `${Math.max((m.count / maxCount) * 120, m.count > 0 ? 4 : 0)}px` }}
                onClick={() => m.count > 0 && openDetail(`${m.label} 예약 목록`, m.rows)}
                title={m.count > 0 ? '클릭하여 상세 보기' : ''}
              />
              <p className="text-xs text-on-surface-variant">{m.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 월별 방문 인원 */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5">
        <h3 className="font-bold text-on-surface mb-5">월별 방문 인원</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.shortLabel} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-on-surface-variant">{m.visitors}</p>
              <button
                className="w-full rounded-t-lg border-2 transition-opacity hover:opacity-75 bg-primary-container border-primary/20"
                style={{
                  height: `${Math.max((m.visitors / maxVisitors) * 120, m.visitors > 0 ? 4 : 0)}px`,
                }}
                onClick={() => m.visitors > 0 && openDetail(`${m.label} 방문 목록`, m.checkedInRows)}
                title={m.visitors > 0 ? '클릭하여 상세 보기' : ''}
              />
              <p className="text-xs text-on-surface-variant">{m.shortLabel}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* 행사별 방문 현황 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5">
          <h3 className="font-bold text-on-surface mb-1">행사별 방문 현황</h3>
          <p className="text-xs text-outline mb-4">행사명을 클릭하면 방문자 목록을 볼 수 있습니다</p>
          {eventStats.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-5">
              {eventStats.map((e, i) => {
                const h = households[e.id] || 0;
                const denom = h > 0 ? h : e.count || 1;
                const reservePct = h > 0 ? Math.round((e.count / h) * 100) : 100;
                const visitPct = h > 0 ? Math.round((e.visitedCount / h) * 100) : e.rate;
                const reserveBarW = Math.min((e.count / denom) * 100, 100);
                const visitBarW = Math.min((e.visitedCount / denom) * 100, 100);
                return (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-outline w-4 shrink-0">{i + 1}</span>
                      <button
                        className="text-sm font-semibold text-on-surface truncate text-left hover:text-primary transition-colors flex-1"
                        onClick={() => e.count > 0 && openDetail(`${e.title} — 전체 목록`, e.rows)}
                      >
                        {e.title}
                      </button>
                      {/* 총 가구수 입력 */}
                      <input
                        type="number"
                        min={0}
                        placeholder="총 가구수"
                        value={h || ''}
                        onChange={ev => setHouseholds(prev => ({ ...prev, [e.id]: Number(ev.target.value) }))}
                        className="w-24 px-2 py-1 text-xs border border-outline-variant rounded-lg text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        onClick={ev => ev.stopPropagation()}
                      />
                    </div>
                    {/* 막대: 회색 배경 위에 초록(예약) → 파란(방문) 겹침 */}
                    <div className="ml-6 relative h-3 rounded-full overflow-hidden bg-surface-container">
                      {/* 초록: 예약 비율 */}
                      <div className="absolute left-0 top-0 h-full rounded-full transition-all"
                        style={{ width: `${reserveBarW}%`, backgroundColor: '#4ade80' }} />
                      {/* 파란: 방문 비율 */}
                      <button className="absolute left-0 top-0 h-full rounded-full transition-all hover:opacity-80 bg-primary"
                        style={{ width: `${visitBarW}%` }}
                        onClick={() => e.visitedCount > 0 && openDetail(`${e.title} — 방문자 목록`, e.checkedInRows)}
                        title="방문자 목록 보기"
                      />
                    </div>
                    {/* 수치 */}
                    <div className="ml-6 mt-1.5 grid grid-cols-5 gap-1 text-xs text-center">
                      <div>
                        <p className="font-bold text-on-surface">{h > 0 ? h.toLocaleString() : '-'}</p>
                        <p className="text-outline">총 가구수</p>
                      </div>
                      <div>
                        <p className="font-bold text-green-600">{e.count}</p>
                        <p className="text-outline">예약건수</p>
                      </div>
                      <div>
                        <p className="font-bold text-green-600">{h > 0 ? `${reservePct}%` : '-'}</p>
                        <p className="text-outline">예약%</p>
                      </div>
                      <div>
                        <button className="font-bold text-primary hover:opacity-70 transition-opacity"
                          onClick={() => e.visitedCount > 0 && openDetail(`${e.title} — 방문자 목록`, e.checkedInRows)}>
                          {e.visitedCount}
                        </button>
                        <p className="text-outline">방문건수</p>
                      </div>
                      <div>
                        <p className="font-bold text-primary">{h > 0 ? `${visitPct}%` : `${e.rate}%`}</p>
                        <p className="text-outline">방문%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 시간대별 방문 인원 */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5">
          <h3 className="font-bold text-on-surface mb-1">시간대별 방문 인원</h3>
          <p className="text-xs text-outline mb-4">시간대를 클릭하면 방문자 목록을 볼 수 있습니다</p>
          {timeEntries.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {timeEntries.map(t => (
                <button
                  key={t.time}
                  className="w-full flex items-center gap-3 hover:bg-surface-container-low rounded-xl px-2 py-1 -mx-2 transition-colors"
                  onClick={() => openDetail(`${t.time} 시간대 방문자 목록`, t.rows)}
                >
                  <span className="text-sm font-bold w-12 shrink-0 text-left text-primary">{t.time}</span>
                  <div className="flex-1 bg-surface-container rounded-full h-3">
                    <div className="h-3 rounded-full bg-primary-container border border-primary/20" style={{ width: `${(t.visitors / maxTimeVisitors) * 100}%` }} />
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-on-surface">{t.visitors}명</span>
                    <span className="text-xs text-on-surface-variant ml-1">({t.count}건)</span>
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
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-outline-variant/15 shrink-0">
              <div>
                <h3 className="font-bold text-on-surface text-sm">{detail.label}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">총 {detail.rows.length}건 · {detail.rows.reduce((s, r) => s + r.attendeeCount, 0)}명</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-surface-container">
                <X size={18} className="text-on-surface-variant" />
              </button>
            </div>
            {/* 목록 */}
            <div className="overflow-y-auto flex-1">
              {detail.rows.length === 0 ? (
                <p className="text-center py-10 text-sm text-on-surface-variant">내역이 없습니다</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-low">
                      {['예약자', '연락처', '방문일', '시간', '인원', '체크인'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-on-surface-variant text-[10px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {detail.rows.map(r => (
                      <tr key={r.id} className="hover:bg-surface-container-low">
                        <td className="px-3 py-2.5 font-medium text-on-surface text-xs">{r.customer.name || r.extraFields['name'] || '-'}</td>
                        <td className="px-3 py-2.5 text-on-surface-variant text-xs">{r.customer.phone || r.extraFields['phone'] || '-'}</td>
                        <td className="px-3 py-2.5 text-on-surface-variant text-xs whitespace-nowrap">{formatDate(r.date)}</td>
                        <td className="px-3 py-2.5 text-on-surface-variant text-xs whitespace-nowrap">{r.time !== '시간 미지정' ? r.time : '-'}</td>
                        <td className="px-3 py-2.5 text-center font-semibold text-xs text-primary">{r.attendeeCount}명</td>
                        <td className="px-3 py-2.5 text-xs">
                          {r.checkedIn
                            ? <span className="text-green-600 font-semibold">✓ 입장</span>
                            : <span className="text-outline">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-5 pb-4 pt-3 border-t border-outline-variant/15 shrink-0">
              <button onClick={() => setDetail(null)} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
