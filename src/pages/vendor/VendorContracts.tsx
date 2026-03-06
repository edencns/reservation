import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Plus, FileText, Trash2, ChevronRight, Pen, X, Upload } from 'lucide-react';
import { getEvents, getVendorContracts, saveVendorContracts, getVendorPreSignature, saveVendorPreSignature, clearVendorPreSignature, getVendorContractTemplate, saveVendorContractTemplate, clearVendorContractTemplate } from '../../utils/storage';
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

  // 계약서 양식 템플릿
  const [template, setTemplate] = useState<string[]>(() => getVendorContractTemplate(vendor.id));
  const templateFileRef = useRef<HTMLInputElement>(null);

  const handleTemplateUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) {
          setTemplate(prev => {
            const next = [...prev, result];
            saveVendorContractTemplate(vendor.id, next);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeTemplateImage = (idx: number) => {
    setTemplate(prev => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) clearVendorContractTemplate(vendor.id);
      else saveVendorContractTemplate(vendor.id, next);
      return next;
    });
  };

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

      {/* 사전 서명 등록 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pen size={15} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">사전 서명</span>
            {preSig
              ? <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">등록됨</span>
              : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">미등록</span>
            }
          </div>
          <div className="flex items-center gap-2">
            {preSig && (
              <button onClick={handleDeleteSig} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                <X size={12} /> 삭제
              </button>
            )}
            <button
              onClick={() => setShowSigModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white hover:opacity-90"
              style={{ backgroundColor: '#667EEA' }}
            >
              {preSig ? '변경' : '등록'}
            </button>
          </div>
        </div>
        {preSig && (
          <div className="mt-3 border border-gray-100 rounded-xl p-2 bg-gray-50">
            <img src={preSig} alt="사전 서명" className="h-12 object-contain" />
          </div>
        )}
      </div>

      {/* 계약서 양식 템플릿 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload size={15} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">계약서 양식</span>
            {template.length > 0
              ? <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{template.length}페이지</span>
              : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">미등록</span>
            }
          </div>
          <div className="flex items-center gap-2">
            {template.length > 0 && (
              <button
                onClick={() => { clearVendorContractTemplate(vendor.id); setTemplate([]); }}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <X size={12} /> 전체 삭제
              </button>
            )}
            <button
              onClick={() => templateFileRef.current?.click()}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white hover:opacity-90"
              style={{ backgroundColor: '#667EEA' }}
            >
              {template.length > 0 ? '페이지 추가' : '양식 업로드'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">양식을 등록하면 "내 양식으로 계약" 옵션으로 전자계약서를 작성할 수 있습니다.</p>
        <input ref={templateFileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleTemplateUpload(e.target.files)} />
        {template.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {template.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt={`양식 ${i + 1}페이지`} className="w-full rounded-xl border border-gray-100 object-cover aspect-[3/4] bg-gray-50" />
                <button
                  onClick={() => removeTemplateImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <X size={10} />
                </button>
                <span className="absolute bottom-1 left-1 text-xs bg-black/40 text-white rounded px-1">{i + 1}p</span>
              </div>
            ))}
          </div>
        )}
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

      {/* 사전 서명 모달 */}
      {showSigModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSigModal(false)}>
          <div className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">사전 서명 등록</h3>
              <button onClick={() => setShowSigModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSigTab('draw')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${sigTab === 'draw' ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                style={sigTab === 'draw' ? { backgroundColor: '#667EEA' } : {}}
              >직접 서명</button>
              <button
                onClick={() => setSigTab('upload')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${sigTab === 'upload' ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                style={sigTab === 'upload' ? { backgroundColor: '#667EEA' } : {}}
              >이미지 업로드</button>
            </div>
            {sigTab === 'draw' ? (
              <div>
                <SignaturePad ref={sigRef} />
                <button
                  onClick={handleSigSave}
                  className="mt-3 w-full py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
                  style={{ backgroundColor: '#667EEA' }}
                >저장</button>
              </div>
            ) : (
              <div>
                <input ref={sigFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleSigImageUpload(e.target.files[0]); }} />
                <button
                  onClick={() => sigFileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all"
                >
                  <Upload size={24} />
                  <span className="text-sm">이미지 선택</span>
                </button>
              </div>
            )}
          </div>
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
