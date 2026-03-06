import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Plus, FileText, Trash2, ChevronRight, Pen, X, Upload } from 'lucide-react';
import { getEvents, getVendorContracts, saveVendorContracts, getVendorPreSignature, saveVendorPreSignature, clearVendorPreSignature } from '../../utils/storage';
import SignaturePad, { type SignaturePadHandle } from '../../components/SignaturePad';
import type { ManagedVendor } from '../../types';

const STATUS_LABEL: Record<string, string> = { draft: '임시저장', completed: '완료' };

export default function VendorContracts() {
  const { vendor } = useOutletContext<{ vendor: ManagedVendor }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventIdFilter = searchParams.get('eventId') ?? 'all';
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [sigTab, setSigTab] = useState<'draw' | 'upload'>('draw');
  const [preSig, setPreSig] = useState<string | null>(() => getVendorPreSignature(vendor.id));
  const sigRef = useRef<SignaturePadHandle>(null);
  const sigFileRef = useRef<HTMLInputElement>(null);

  const handleSigSave = () => {
    if (sigTab === 'draw') {
      if (!sigRef.current || sigRef.current.isEmpty()) return;
      const dataUrl = sigRef.current.toDataURL();
      saveVendorPreSignature(vendor.id, dataUrl);
      setPreSig(dataUrl);
    }
    setShowSigModal(false);
  };

  const handleSigImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        saveVendorPreSignature(vendor.id, dataUrl);
        setPreSig(dataUrl);
        setShowSigModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSig = () => {
    clearVendorPreSignature(vendor.id);
    setPreSig(null);
  };

  const allEvents = getEvents();
  const myEvents = allEvents.filter(e =>
    (e.vendors ?? []).some(v => v.managedVendorId === vendor.id)
  );

  const allContracts = getVendorContracts().filter(c => c.vendorId === vendor.id);
  const filtered = eventIdFilter === 'all'
    ? allContracts
    : allContracts.filter(c => c.eventId === eventIdFilter);
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updated = getVendorContracts().filter(c => c.id !== deleteTarget);
    saveVendorContracts(updated);
    setDeleteTarget(null);
    window.location.reload();
  };

  const formatAmount = (n: number) =>
    n > 0 ? `${n.toLocaleString()}원` : '-';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">계약 목록</h2>
        <button
          onClick={() => navigate(`/vendor/contracts/new${eventIdFilter !== 'all' ? `?eventId=${eventIdFilter}` : ''}`)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
          style={{ backgroundColor: '#667EEA' }}
        >
          <Plus size={15} /> 새 계약
        </button>
      </div>

      {/* 행사 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => navigate('/vendor/contracts')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            eventIdFilter === 'all' ? 'text-white' : 'bg-gray-100 text-gray-600'
          }`}
          style={eventIdFilter === 'all' ? { backgroundColor: '#667EEA' } : {}}
        >
          전체
        </button>
        {myEvents.map(e => (
          <button
            key={e.id}
            onClick={() => navigate(`/vendor/contracts?eventId=${e.id}`)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              eventIdFilter === e.id ? 'text-white' : 'bg-gray-100 text-gray-600'
            }`}
            style={eventIdFilter === e.id ? { backgroundColor: '#667EEA' } : {}}
          >
            {e.title}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">총 {sorted.length}건</p>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">계약 내역이 없습니다.</p>
          <button
            onClick={() => navigate('/vendor/contracts/new')}
            className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
            style={{ backgroundColor: '#667EEA' }}
          >
            첫 계약 작성하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(contract => (
            <div key={contract.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/vendor/contracts/${contract.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        contract.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {STATUS_LABEL[contract.status]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {contract.type === 'electronic' ? '전자계약서' : '파일 업로드'}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800">{contract.unitNumber} · {contract.customerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{contract.eventTitle}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-500">계약금액 <span className="font-semibold text-gray-700">{formatAmount(contract.totalAmount)}</span></span>
                      <span className="text-xs text-gray-400">{contract.contractDate}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
                </div>
              </div>
              <div className="border-t border-gray-50 px-4 py-2 flex justify-end">
                <button
                  onClick={() => setDeleteTarget(contract.id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 py-1 px-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={12} /> 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-2">계약 삭제</h3>
            <p className="text-sm text-gray-500 mb-6">이 계약 내역을 삭제하시겠습니까?<br />삭제된 데이터는 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                취소
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
