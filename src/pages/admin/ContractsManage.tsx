import { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getVendorContracts, getManagedVendors } from '../../utils/storage';
import type { VendorContract } from '../../types';

const STATUS_LABEL: Record<string, string> = { draft: '임시저장', completed: '완료' };
const TYPE_LABEL: Record<string, string> = { electronic: '전자계약서', upload: '파일 업로드' };

function formatAmount(n: number) {
  return n > 0 ? `${n.toLocaleString()}원` : '-';
}

export default function ContractsManage() {
  const { events } = useApp();
  const allContracts = getVendorContracts();
  const allVendors = getManagedVendors();

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailC, setDetailC] = useState<VendorContract | null>(null);
  const [unitView, setUnitView] = useState(false);

  const filtered = useMemo(() => allContracts.filter(c => {
    const matchSearch = !search || [c.unitNumber, c.customerName, c.vendorName, c.customerPhone]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchEvent = eventFilter === 'all' || c.eventId === eventFilter;
    const matchVendor = vendorFilter === 'all' || c.vendorId === vendorFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchEvent && matchVendor && matchStatus;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [allContracts, search, eventFilter, vendorFilter, statusFilter]);

  // 동호수별 그룹 (단지 계약 현황)
  const byUnit = useMemo(() => {
    const map = new Map<string, VendorContract[]>();
    filtered.forEach(c => {
      const key = c.unitNumber;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ko'));
  }, [filtered]);

  // 참여 업체 목록 (필터용)
  const vendorOptions = useMemo(() => {
    const ids = new Set(allContracts.map(c => c.vendorId));
    return allVendors.filter(v => ids.has(v.id));
  }, [allContracts, allVendors]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">계약 관리</h2>
        <button
          onClick={() => setUnitView(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
            unitView ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          style={unitView ? { backgroundColor: '#667EEA' } : {}}
        >
          {unitView ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {unitView ? '목록 보기' : '동호수별 현황'}
        </button>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="동호수, 고객명, 업체명, 연락처 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white"
          >
            <option value="all">모든 행사</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select
            value={vendorFilter}
            onChange={e => setVendorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white"
          >
            <option value="all">모든 업체</option>
            {vendorOptions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <div className="flex gap-2">
            {[
              { value: 'all', label: '전체' },
              { value: 'completed', label: '완료' },
              { value: 'draft', label: '임시저장' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === f.value ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={statusFilter === f.value ? { backgroundColor: '#667EEA' } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">총 {filtered.length}건</p>

      {/* 동호수별 현황 */}
      {unitView ? (
        <div className="space-y-3">
          {byUnit.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400 text-sm">계약 내역이 없습니다</div>
          ) : byUnit.map(([unit, contracts]) => (
            <div key={unit} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#E0D6F9' }}>
                <span className="font-bold text-gray-800">{unit}</span>
                <span className="text-xs text-gray-500">{contracts.length}건</span>
                <span className="text-xs font-semibold ml-auto" style={{ color: '#667EEA' }}>
                  {formatAmount(contracts.reduce((s, c) => s + c.totalAmount, 0))}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {contracts.map(c => (
                  <div
                    key={c.id}
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setDetailC(c)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{c.vendorName}</p>
                      <p className="text-xs text-gray-400">{c.vendorCategory} · {c.eventTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-700">{formatAmount(c.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        c.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 목록 뷰 */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#E0D6F9' }}>
                  {['동호수', '고객명', '업체명', '행사', '계약금액', '유형', '상태', '계약일', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">계약 내역이 없습니다</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id}
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => setDetailC(c)}>
                    <td className="px-3 py-3 font-semibold text-gray-800">{c.unitNumber}</td>
                    <td className="px-3 py-3 text-gray-700">{c.customerName}</td>
                    <td className="px-3 py-3">
                      <p className="text-gray-800">{c.vendorName}</p>
                      <p className="text-xs text-gray-400">{c.vendorCategory}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-500 max-w-[150px] truncate">{c.eventTitle}</td>
                    <td className="px-3 py-3 font-semibold text-gray-700">{formatAmount(c.totalAmount)}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{TYPE_LABEL[c.type]}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">{c.contractDate}</td>
                    <td className="px-3 py-3 text-xs text-gray-300">상세 →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm">계약 내역이 없습니다</p>
            ) : filtered.map(c => (
              <div key={c.id} className="p-4 cursor-pointer hover:bg-blue-50" onClick={() => setDetailC(c)}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-bold text-gray-800">{c.unitNumber} · {c.customerName}</p>
                    <p className="text-xs text-gray-500">{c.vendorName} · {c.eventTitle}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    c.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-1">{formatAmount(c.totalAmount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 계약 상세 모달 */}
      {detailC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDetailC(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-gray-800">계약 상세</h3>
              <button onClick={() => setDetailC(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-5">
              {/* 메타 */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                {[
                  ['행사', detailC.eventTitle],
                  ['업체명', `${detailC.vendorName} (${detailC.vendorCategory})`],
                  ['계약 유형', TYPE_LABEL[detailC.type]],
                  ['계약 날짜', detailC.contractDate],
                  ['상태', STATUS_LABEL[detailC.status]],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
              {/* 고객 정보 */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">고객 정보</p>
                <div className="space-y-1.5 text-sm">
                  {[
                    ['동호수', detailC.unitNumber],
                    ['고객명', detailC.customerName],
                    ['연락처', detailC.customerPhone || '-'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-gray-50 pb-1.5">
                      <span className="text-gray-400">{label}</span>
                      <span className="font-medium text-gray-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 계약 내용 (전자계약서) */}
              {detailC.type === 'electronic' && detailC.items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">계약 품목</p>
                  <div className="space-y-1.5">
                    {detailC.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm border-b border-gray-50 pb-1.5">
                        <span className="text-gray-700">{item.description || '(품목 없음)'}</span>
                        <span className="text-gray-500">{item.quantity}개 × {item.unitPrice.toLocaleString()}원 = <span className="font-semibold text-gray-700">{item.amount.toLocaleString()}원</span></span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">합계</span>
                      <span className="font-bold text-gray-800">{detailC.totalAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">계약금</span>
                      <span className="text-gray-700">{detailC.depositAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">잔금</span>
                      <span className="text-gray-700">{(detailC.totalAmount - detailC.depositAmount).toLocaleString()}원</span>
                    </div>
                    {detailC.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">결제방법</span>
                        <span className="text-gray-700">{detailC.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 서명 */}
              {(detailC.customerSignature || detailC.vendorSignature) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">서명</p>
                  <div className="grid grid-cols-2 gap-3">
                    {detailC.customerSignature && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">고객 서명</p>
                        <img src={detailC.customerSignature} alt="고객서명" className="border border-gray-100 rounded-xl w-full" />
                      </div>
                    )}
                    {detailC.vendorSignature && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">업체 서명</p>
                        <img src={detailC.vendorSignature} alt="업체서명" className="border border-gray-100 rounded-xl w-full" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 업로드 이미지 */}
              {detailC.type === 'upload' && (detailC.uploadedImages?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">계약서 이미지</p>
                  <div className="grid grid-cols-2 gap-3">
                    {detailC.uploadedImages!.map((img, i) => (
                      <img key={i} src={img} alt={`계약서 ${i + 1}`} className="border border-gray-100 rounded-xl w-full object-cover aspect-[3/4]" />
                    ))}
                  </div>
                </div>
              )}
              {/* 메모 */}
              {detailC.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">메모</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{detailC.notes}</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 shrink-0 border-t border-gray-100">
              <button
                onClick={() => setDetailC(null)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: '#667EEA' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
