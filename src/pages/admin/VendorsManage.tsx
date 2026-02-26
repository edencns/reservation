import { useState, useRef } from 'react';
import { Plus, Trash2, ChevronLeft, X, FileImage, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateId } from '../../utils/helpers';
import type { ManagedVendor, VendorDocument } from '../../types';

const EMPTY_VENDOR: Omit<ManagedVendor, 'id' | 'createdAt'> = {
  name: '', phone: '', email: '', businessType: '', products: '',
  representativeName: '', address: '', contactName: '', contactPhone: '',
  notes: '', imageUrl: undefined, documents: [],
};

function ImageUpload({ value, onChange, height = 'h-36' }: { value: string; onChange: (v: string) => void; height?: string }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handle = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string ?? '');
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-1.5">
      {value ? (
        <div className="relative inline-flex">
          <img src={value} alt="" className={`${height} w-auto object-contain rounded-xl border border-gray-200 bg-gray-50 p-1`} />
          <button type="button" onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
            <X size={10} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed rounded-xl py-4 text-center cursor-pointer transition-colors ${dragging ? 'border-[#667EEA] bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
        >
          <FileImage size={20} className="mx-auto mb-1 text-gray-300" />
          <p className="text-xs text-gray-400">드래그하거나 <span className="font-semibold" style={{ color: '#667EEA' }}>클릭하여 업로드</span></p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ''; }} />
    </div>
  );
}

type FormState = Omit<ManagedVendor, 'id' | 'createdAt'>;

export default function VendorsManage() {
  const { managedVendors, addManagedVendor, updateManagedVendor, deleteManagedVendor } = useApp();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_VENDOR);
  const [newDocName, setNewDocName] = useState('');

  const openNew = () => { setForm(EMPTY_VENDOR); setEditingId('new'); };
  const openEdit = (v: ManagedVendor) => { setForm({ ...v }); setEditingId(v.id); };
  const close = () => { setEditingId(null); setNewDocName(''); };

  const set = (key: keyof FormState, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const addDoc = () => {
    if (!newDocName.trim()) return;
    const doc: VendorDocument = { id: generateId(), name: newDocName.trim(), imageUrl: '' };
    setForm(prev => ({ ...prev, documents: [...prev.documents, doc] }));
    setNewDocName('');
  };
  const updateDoc = (id: string, patch: Partial<VendorDocument>) =>
    setForm(prev => ({ ...prev, documents: prev.documents.map(d => d.id === id ? { ...d, ...patch } : d) }));
  const removeDoc = (id: string) =>
    setForm(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));

  const handleSave = () => {
    if (!form.name.trim()) { alert('상호를 입력해주세요.'); return; }
    if (editingId === 'new') {
      addManagedVendor({ ...form, id: generateId(), createdAt: new Date().toISOString() });
    } else if (editingId) {
      updateManagedVendor({ ...form, id: editingId, createdAt: managedVendors.find(v => v.id === editingId)?.createdAt ?? new Date().toISOString() });
    }
    close();
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  if (editingId !== null) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800 text-lg">{editingId === 'new' ? '새 업체 등록' : '업체 수정'}</h2>
        </div>

        <div className="space-y-5">
          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm border-b pb-2">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>상호 <span className="text-red-400">*</span></label>
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="예) 한샘" />
              </div>
              <div>
                <label className={labelCls}>전화번호</label>
                <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="02-0000-0000" />
              </div>
              <div>
                <label className={labelCls}>이메일</label>
                <input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@email.com" />
              </div>
              <div>
                <label className={labelCls}>업종</label>
                <input className={inputCls} value={form.businessType} onChange={e => set('businessType', e.target.value)} placeholder="예) 가구" />
              </div>
              <div>
                <label className={labelCls}>취급상품</label>
                <input className={inputCls} value={form.products} onChange={e => set('products', e.target.value)} placeholder="예) 소파, 침대, 책상" />
              </div>
              <div>
                <label className={labelCls}>대표자 이름</label>
                <input className={inputCls} value={form.representativeName} onChange={e => set('representativeName', e.target.value)} placeholder="홍길동" />
              </div>
              <div>
                <label className={labelCls}>주소</label>
                <input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} placeholder="서울시 강남구 ..." />
              </div>
              <div>
                <label className={labelCls}>담당자 이름</label>
                <input className={inputCls} value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="홍길동" />
              </div>
              <div>
                <label className={labelCls}>담당자 번호</label>
                <input className={inputCls} value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="010-0000-0000" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>비고</label>
                <textarea className={inputCls} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="메모" />
              </div>
            </div>
          </div>

          {/* 업체 이미지 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-gray-700 text-sm border-b pb-2">업체 이미지</h3>
            <ImageUpload value={form.imageUrl ?? ''} onChange={v => setForm(prev => ({ ...prev, imageUrl: v || undefined }))} />
          </div>

          {/* 서류 이미지 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm border-b pb-2">서류 이미지</h3>

            {/* 기존 서류 목록 */}
            {form.documents.map(doc => (
              <div key={doc.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                    value={doc.name}
                    onChange={e => updateDoc(doc.id, { name: e.target.value })}
                    placeholder="서류 이름"
                  />
                  <button type="button" onClick={() => removeDoc(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <ImageUpload value={doc.imageUrl} onChange={v => updateDoc(doc.id, { imageUrl: v })} height="h-28" />
              </div>
            ))}

            {/* 새 서류 추가 */}
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                placeholder="서류 이름 입력 (예: 사업자등록증)"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDoc())}
              />
              <button type="button" onClick={addDoc} disabled={!newDocName.trim()}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                style={{ backgroundColor: '#667EEA' }}>
                <Plus size={14} /> 추가
              </button>
            </div>
          </div>

          {/* 저장/취소 */}
          <div className="flex gap-3 pb-8">
            <button type="button" onClick={close}
              className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">
              취소
            </button>
            <button type="button" onClick={handleSave}
              className="flex-1 py-3 rounded-xl font-bold text-white hover:opacity-90"
              style={{ backgroundColor: '#667EEA' }}>
              {editingId === 'new' ? '등록' : '수정 완료'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 목록 화면
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">행사 등록 시 이 목록에서 업체를 선택할 수 있습니다.</p>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
          style={{ backgroundColor: '#667EEA' }}>
          <Plus size={15} /> 새 업체 등록
        </button>
      </div>

      {managedVendors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm text-gray-400">
          <FileImage size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">등록된 업체가 없습니다.</p>
          <button onClick={openNew} className="mt-3 text-sm font-semibold hover:underline" style={{ color: '#667EEA' }}>
            첫 번째 업체 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {managedVendors.map(v => (
            <div key={v.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              {v.imageUrl ? (
                <img src={v.imageUrl} alt={v.name} className="w-14 h-14 object-contain rounded-xl border border-gray-100 bg-gray-50 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center text-gray-300">
                  <FileImage size={22} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{v.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{[v.businessType, v.phone].filter(Boolean).join(' · ')}</p>
                {v.documents.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">서류 {v.documents.length}건</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEdit(v)}
                  className="p-2 text-gray-400 hover:text-[#667EEA] hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => { if (confirm(`'${v.name}'을(를) 삭제할까요?`)) deleteManagedVendor(v.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
