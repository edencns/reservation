import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, paymentLabel } from '../../utils/helpers';
import { Download } from 'lucide-react';

export default function Settlement() {
  const { reservations, events } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const key = `${year}-${String(month).padStart(2, '0')}`;
  const monthRes = reservations.filter(r => r.createdAt.startsWith(key));
  const confirmed = monthRes.filter(r => r.status === 'confirmed');
  const cancelled = monthRes.filter(r => r.status === 'cancelled');

  const totalRevenue = confirmed.reduce((s, r) => s + r.totalAmount, 0);
  const FEE_RATE = 0.035; // 3.5% 수수료
  const fee = Math.round(totalRevenue * FEE_RATE);
  const netRevenue = totalRevenue - fee;

  // Payment method breakdown
  const paymentBreakdown = (['card', 'bank', 'phone'] as const).map(method => {
    const methodRes = confirmed.filter(r => r.paymentMethod === method);
    return {
      method,
      count: methodRes.length,
      amount: methodRes.reduce((s, r) => s + r.totalAmount, 0),
    };
  });

  // Per-event breakdown
  const eventBreakdown = events.map(e => {
    const eRes = confirmed.filter(r => r.eventId === e.id);
    return {
      title: e.title,
      count: eRes.length,
      amount: eRes.reduce((s, r) => s + r.totalAmount, 0),
    };
  }).filter(e => e.count > 0).sort((a, b) => b.amount - a.amount);

  const summaryCards = [
    { label: '예약 건수', value: confirmed.length + '건', sub: `취소 ${cancelled.length}건`, color: '#91ADC2' },
    { label: '총 매출', value: formatCurrency(totalRevenue), sub: '부가세 포함', color: '#7EC8C8' },
    { label: '수수료 (3.5%)', value: formatCurrency(fee), sub: '서비스 이용료', color: '#F4A261' },
    { label: '정산 예정액', value: formatCurrency(netRevenue), sub: '수수료 차감 후', color: '#E76F51' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="font-bold text-gray-800">정산 관리</h2>
        <div className="flex gap-2 items-center ml-auto">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#91ADC2]">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#91ADC2]">
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
            <p className="font-extrabold text-gray-800 text-lg leading-tight">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Payment method breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">결제 수단별 내역</h3>
          <div className="space-y-3">
            {paymentBreakdown.map(p => (
              <div key={p.method} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{p.method === 'card' ? '💳' : p.method === 'bank' ? '🏦' : '📱'}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{paymentLabel[p.method]}</p>
                    <p className="text-xs text-gray-400">{p.count}건</p>
                  </div>
                </div>
                <p className="font-bold text-sm" style={{ color: '#91ADC2' }}>{formatCurrency(p.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4">이벤트별 정산</h3>
          {eventBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">해당 월 데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {eventBreakdown.map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.count}건</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: '#91ADC2' }}>{formatCurrency(e.amount)}</p>
                    <p className="text-xs text-gray-400">
                      정산 {formatCurrency(Math.round(e.amount * (1 - FEE_RATE)))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-gray-700">상세 내역</h3>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <Download size={15} /> 다운로드
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['날짜', '이벤트', '예약자', '결제수단', '금액', '수수료', '정산액', '상태'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthRes.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">해당 월 예약 없음</td></tr>
              ) : monthRes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(r => {
                const rFee = r.status === 'confirmed' ? Math.round(r.totalAmount * FEE_RATE) : 0;
                return (
                  <tr key={r.id} className={`hover:bg-gray-50 ${r.status === 'cancelled' ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {r.createdAt.split('T')[0]}
                    </td>
                    <td className="px-4 py-3 max-w-[140px]">
                      <p className="font-medium text-gray-800 truncate">{r.eventTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.customer.name}</td>
                    <td className="px-4 py-3 text-gray-600">{paymentLabel[r.paymentMethod]}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{formatCurrency(r.totalAmount)}</td>
                    <td className="px-4 py-3 text-orange-500">{r.status === 'confirmed' ? formatCurrency(rFee) : '-'}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#91ADC2' }}>
                      {r.status === 'confirmed' ? formatCurrency(r.totalAmount - rFee) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                      }`}>
                        {r.status === 'confirmed' ? '정산 예정' : '취소'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
