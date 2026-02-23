import { useApp } from '../../context/AppContext';
import { formatCurrency, categoryLabel } from '../../utils/helpers';

export default function Statistics() {
  const { reservations, events } = useApp();
  const confirmed = reservations.filter(r => r.status === 'confirmed');

  // Monthly stats (last 6 months)
  const monthlyData = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}월`;
      const monthRes = confirmed.filter(r => r.createdAt.startsWith(key));
      return {
        label,
        count: monthRes.length,
        revenue: monthRes.reduce((s, r) => s + r.totalAmount, 0),
      };
    });
  })();

  const maxCount = Math.max(...monthlyData.map(m => m.count), 1);
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  // Per-event stats
  const eventStats = events.map(e => {
    const eRes = confirmed.filter(r => r.eventId === e.id);
    return {
      title: e.title,
      category: e.category,
      count: eRes.length,
      revenue: eRes.reduce((s, r) => s + r.totalAmount, 0),
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Category stats
  const categoryStats = Object.entries(
    confirmed.reduce((acc, r) => {
      const event = events.find(e => e.id === r.eventId);
      const cat = event?.category ?? 'other';
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-gray-800">통계</h2>

      {/* Monthly booking chart */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-5">월별 예약 현황</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-600">{m.count}</p>
              <div className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${Math.max((m.count / maxCount) * 120, m.count > 0 ? 4 : 0)}px`,
                  backgroundColor: '#91ADC2',
                }} />
              <p className="text-xs text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-5">월별 매출 현황</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs font-bold text-gray-600">
                {m.revenue > 0 ? `${(m.revenue / 10000).toFixed(0)}만` : '0'}
              </p>
              <div className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${Math.max((m.revenue / maxRevenue) * 120, m.revenue > 0 ? 4 : 0)}px`,
                  backgroundColor: '#FFDAB9',
                  border: '2px solid #f5c49a',
                }} />
              <p className="text-xs text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Per event */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">이벤트별 예약</h3>
          {eventStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {eventStats.map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{e.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full"
                          style={{
                            width: `${(e.count / Math.max(...eventStats.map(x => x.count), 1)) * 100}%`,
                            backgroundColor: '#91ADC2',
                          }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#91ADC2' }}>{e.count}건</p>
                    <p className="text-xs text-gray-400">{formatCurrency(e.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">카테고리별 예약</h3>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map(({ cat, count }) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-20 shrink-0">{categoryLabel[cat]}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div className="h-3 rounded-full transition-all"
                      style={{
                        width: `${(count / confirmed.length) * 100}%`,
                        backgroundColor: '#FFDAB9',
                        border: '1.5px solid #f5c49a',
                      }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 shrink-0">{count}건</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
