import { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getVendorContracts, getManagedVendors } from '../../utils/storage';
import { exportToExcel } from '../../utils/exportExcel';
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

  const handleExport = () => {
    const contractData = filtered.map(c => ({
      '동호수': c.unitNumber,
      '고객명': c.customerName,
      '연락처': c.customerPhone || '',
      '업체명': c.vendorName,
      '업체 카테고리': c.vendorCategory,
      '행사명': c.eventTitle,
      '계약금액': c.totalAmount,
      '계약금': c.depositAmount,
      '잔금': c.totalAmount - c.depositAmount,
      '결제방법': c.paymentMethod || '',
      '계약 유형': TYPE_LABEL[c.type],
      '상태': STATUS_LABEL[c.status],
      '계약일': c.contractDate,
    }));
    const unitData = byUnit.map(([unit, contracts]) => ({
      '동호수': unit,
      '계약 수': contracts.length,
      '총 계약금액': contracts.reduce((s, c) => s + c.totalAmount, 0),
      '완료': contracts.filter(c => c.status === 'completed').length,
      '임시저장': contracts.filter(c => c.status === 'draft').length,
    }));
    exportToExcel('계약관리', [
      { name: '계약 목록', data: contractData },
      { name: '동호수별 현황', data: unitData },
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-on-surface">계약 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container"
          >
            <Download size={15} /> 엑셀
          </button>
          <button
            onClick={() => setUnitView(v => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              unitView ? 'bg-primary text-on-primary border-transparent' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {unitView ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {unitView ? '목록 보기' : '동호수별 현황'}
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="동호수, 고객명, 업체명, 연락처 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-3 py-2 border border-outline-variant rounded-xl text-sm text-on-surface bg-surface-container-lowest"
          >
            <option value="all">모든 행사</option>
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select
            value={vendorFilter}
            onChange={e => setVendorFilter(e.target.value)}
            className="px-3 py-2 border border-outline-variant rounded-xl text-sm text-on-surface bg-surface-container-lowest"
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
                  statusFilter === f.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-on-surface-variant">총 {filtered.length}건</p>

      {/* 동호수별 현황 */}
      {unitView ? (
        <div className="space-y-3">
          {byUnit.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-10 text-center text-on-surface-variant text-sm">계약 내역이 없습니다</div>
          ) : byUnit.map(([unit, contracts]) => (
            <div key={unit} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3 bg-surface-container-low">
                <span className="font-bold text-on-surface">{unit}</span>
                <span className="text-xs text-on-surface-variant">{contracts.length}건</span>
                <span className="text-xs font-semibold ml-auto text-primary">
                  {formatAmount(contracts.reduce((s, c) => s + c.totalAmount, 0))}
                </span>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {contracts.map(c => (
                  <div
                    key={c.id}
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-surface-container-low"
                    onClick={() => setDetailC(c)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface">{c.vendorName}</p>
                      <p className="text-xs text-outline">{c.vendorCategory} · {c.eventTitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-on-surface">{formatAmount(c.totalAmount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        c.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-700'
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
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low">
                  {['동호수', '고객명', '업체명', '행사', '계약금액', '유형', '상태', '계약일', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-on-surface-variant text-[10px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-on-surface-variant">계약 내역이 없습니다</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id}
                    className="cursor-pointer hover:bg-surface-container-low transition-colors"
                    onClick={() => setDetailC(c)}>
                    <td className="px-3 py-3 font-semibold text-on-surface">{c.unitNumber}</td>
                    <td className="px-3 py-3 text-on-surface">{c.customerName}</td>
                    <td className="px-3 py-3">
                      <p className="text-on-surface">{c.vendorName}</p>
                      <p className="text-xs text-outline">{c.vendorCategory}</p>
                    </td>
                    <td className="px-3 py-3 text-on-surface-variant max-w-[150px] truncate">{c.eventTitle}</td>
                    <td className="px-3 py-3 font-semibold text-on-surface">{formatAmount(c.totalAmount)}</td>
                    <td className="px-3 py-3 text-xs text-on-surface-variant">{TYPE_LABEL[c.type]}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-on-surface-variant text-xs whitespace-nowrap">{c.contractDate}</td>
                    <td className="px-3 py-3 text-xs text-outline-variant">상세 →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-outline-variant/10">
            {filtered.length === 0 ? (
              <p className="text-center py-10 text-on-surface-variant text-sm">계약 내역이 없습니다</p>
            ) : filtered.map(c => (
              <div key={c.id} className="p-4 cursor-pointer hover:bg-surface-container-low" onClick={() => setDetailC(c)}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-bold text-on-surface">{c.unitNumber} · {c.customerName}</p>
                    <p className="text-xs text-on-surface-variant">{c.vendorName} · {c.eventTitle}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    c.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-on-surface mt-1">{formatAmount(c.totalAmount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 계약 상세 모달 */}
      {detailC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDetailC(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-outline-variant/15 shrink-0">
              <h3 className="font-bold text-on-surface">계약 상세</h3>
              <button onClick={() => setDetailC(null)} className="p-1 rounded-lg hover:bg-surface-container">
                <X size={18} className="text-on-surface-variant" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-5">
              {/* 메타 */}
              <div className="bg-surface-container-low rounded-xl p-3 space-y-1.5 text-sm">
                {[
                  ['행사', detailC.eventTitle],
                  ['업체명', `${detailC.vendorName} (${detailC.vendorCategory})`],
                  ['계약 유형', TYPE_LABEL[detailC.type]],
                  ['계약 날짜', detailC.contractDate],
                  ['상태', STATUS_LABEL[detailC.status]],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-medium text-on-surface">{val}</span>
                  </div>
                ))}
              </div>
              {/* 고객 정보 */}
              <div>
                <p className="text-xs font-semibold text-on-surface-variant mb-2">고객 정보</p>
                <div className="space-y-1.5 text-sm">
                  {[
                    ['동호수', detailC.unitNumber],
                    ['고객명', detailC.customerName],
                    ['연락처', detailC.customerPhone || '-'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between border-b border-outline-variant/10 pb-1.5">
                      <span className="text-on-surface-variant">{label}</span>
                      <span className="font-medium text-on-surface">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 계약 내용 (전자계약서) */}
              {detailC.type === 'electronic' && detailC.items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-2">계약 품목</p>
                  <div className="space-y-1.5">
                    {detailC.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm border-b border-outline-variant/10 pb-1.5">
                        <span className="text-on-surface">{item.description || '(품목 없음)'}</span>
                        <span className="text-on-surface-variant">{item.quantity}개 × {item.unitPrice.toLocaleString()}원 = <span className="font-semibold text-on-surface">{item.amount.toLocaleString()}원</span></span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 bg-surface-container-low rounded-xl p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">합계</span>
                      <span className="font-bold text-on-surface">{detailC.totalAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">계약금</span>
                      <span className="text-on-surface">{detailC.depositAmount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">잔금</span>
                      <span className="text-on-surface">{(detailC.totalAmount - detailC.depositAmount).toLocaleString()}원</span>
                    </div>
                    {detailC.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">결제방법</span>
                        <span className="text-on-surface">{detailC.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 서명 */}
              {(detailC.customerSignature || detailC.vendorSignature) && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-2">서명</p>
                  <div className="grid grid-cols-2 gap-3">
                    {detailC.customerSignature && (
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">고객 서명</p>
                        <img src={detailC.customerSignature} alt="고객서명" className="border border-outline-variant/15 rounded-xl w-full" />
                      </div>
                    )}
                    {detailC.vendorSignature && (
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">업체 서명</p>
                        <img src={detailC.vendorSignature} alt="업체서명" className="border border-outline-variant/15 rounded-xl w-full" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* 업로드 이미지 */}
              {detailC.type === 'upload' && (detailC.uploadedImages?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-2">계약서 이미지</p>
                  <div className="grid grid-cols-2 gap-3">
                    {detailC.uploadedImages!.map((img, i) => (
                      <img key={i} src={img} alt={`계약서 ${i + 1}`} className="border border-outline-variant/15 rounded-xl w-full object-cover aspect-[3/4]" />
                    ))}
                  </div>
                </div>
              )}
              {/* 메모 */}
              {detailC.notes && (
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-1">메모</p>
                  <p className="text-sm text-on-surface bg-surface-container-low rounded-xl p-3">{detailC.notes}</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-5 pt-3 shrink-0 border-t border-outline-variant/15">
              <button
                onClick={() => setDetailC(null)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90"
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
