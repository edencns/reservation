import { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, ChevronLeft, X, FileImage, Pencil, Settings2, Search, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateId } from '../../utils/helpers';
import { getVendorCategoryOptions, saveVendorCategoryOptions } from '../../utils/storage';
import { exportToExcel } from '../../utils/exportExcel';
import type { ManagedVendor, VendorDocument } from '../../types';

const EMPTY_VENDOR: Omit<ManagedVendor, 'id' | 'createdAt'> = {
  name: '', phone: '', email: '', category: '', products: '',
  representativeName: '', address: '', contactName: '', contactPhone: '',
  notes: '', imageUrl: undefined, documents: [],
  businessNumber: '',
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
          <img src={value} alt="" className={`${height} w-auto object-contain rounded-xl border border-outline-variant bg-surface-container-low p-1`} />
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
          className={`border-2 border-dashed rounded-xl py-4 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant hover:border-outline hover:bg-surface-container-low'}`}
        >
          <FileImage size={20} className="mx-auto mb-1 text-outline" />
          <p className="text-xs text-on-surface-variant">드래그하거나 <span className="font-semibold text-primary">클릭하여 업로드</span></p>
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
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  // 카테고리 옵션 관리
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => getVendorCategoryOptions());
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [catEditing, setCatEditing] = useState<string[]>([]); // 편집 중인 카테고리 목록 (복사본)
  const [newCatInput, setNewCatInput] = useState('');

  const openCategoryEditor = () => {
    setCatEditing([...categoryOptions]);
    setNewCatInput('');
    setShowCategoryEditor(true);
  };
  const saveCategoryEditor = () => {
    const cleaned = catEditing.map(c => c.trim()).filter(Boolean);
    // 현재 form에서 선택된 카테고리가 목록에 없으면 유지
    const merged = form.category && !cleaned.includes(form.category)
      ? [...cleaned, form.category]
      : cleaned;
    setCategoryOptions(merged);
    saveVendorCategoryOptions(merged);
    setShowCategoryEditor(false);
  };
  const addCatOption = () => {
    const v = newCatInput.trim();
    if (!v || catEditing.includes(v)) return;
    setCatEditing(prev => [...prev, v]);
    setNewCatInput('');
  };
  const removeCatOption = (i: number) => setCatEditing(prev => prev.filter((_, idx) => idx !== i));
  const renameCatOption = (i: number, val: string) =>
    setCatEditing(prev => prev.map((c, idx) => idx === i ? val : c));

  const openNew = () => { setForm({ ...EMPTY_VENDOR }); setEditingId('new'); };
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
    if (!form.businessNumber?.trim()) { alert('사업자번호를 입력해주세요.'); return; }
    // 사업자번호 중복 체크 (신규 등록 시)
    if (editingId === 'new') {
      const dup = managedVendors.find(v => v.businessNumber && v.businessNumber.replace(/-/g, '') === form.businessNumber!.replace(/-/g, ''));
      if (dup) { alert(`이미 등록된 사업자번호입니다. (${dup.name})`); return; }
    }
    if (editingId === 'new') {
      addManagedVendor({ ...form, id: generateId(), createdAt: new Date().toISOString() });
    } else if (editingId) {
      updateManagedVendor({ ...form, id: editingId, createdAt: managedVendors.find(v => v.id === editingId)?.createdAt ?? new Date().toISOString() });
    }
    close();
  };

  const filteredVendors = useMemo(() => managedVendors.filter(v => {
    const matchSearch = !search || v.name.includes(search) || v.contactName.includes(search) || v.phone.includes(search);
    const matchCat = catFilter === 'all' || v.category === catFilter;
    return matchSearch && matchCat;
  }), [managedVendors, search, catFilter]);

  const handleExport = () => {
    const data = filteredVendors.map(v => ({
      '상호': v.name,
      '카테고리': v.category,
      '전화번호': v.phone,
      '이메일': v.email,
      '대표자': v.representativeName,
      '주소': v.address,
      '담당자': v.contactName,
      '담당자 번호': v.contactPhone,
      '취급상품': v.products,
      '비고': v.notes,
    }));
    exportToExcel('입점업체', [{ name: '업체 목록', data }]);
  };

  const inputCls = 'w-full px-3 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary';
  const labelCls = 'block text-xs font-semibold text-on-surface-variant mb-1';

  if (editingId !== null) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-surface-container">
            <ChevronLeft size={22} className="text-on-surface-variant" />
          </button>
          <h2 className="font-bold text-on-surface text-lg">{editingId === 'new' ? '새 업체 등록' : '업체 수정'}</h2>
        </div>

        <div className="space-y-5">
          {/* 기본 정보 */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5 space-y-4">
            <h3 className="font-bold text-on-surface text-sm border-b border-outline-variant/15 pb-2">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>상호 <span className="text-red-400">*</span></label>
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="예) 한샘" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>사업자번호 <span className="text-red-400">*</span></label>
                <input
                  className={inputCls}
                  value={form.businessNumber ?? ''}
                  onChange={e => set('businessNumber', e.target.value)}
                  placeholder="예) 123-45-67890"
                  maxLength={12}
                />
                <p className="text-xs text-outline mt-1">사업자번호 기준으로 동일 업체 여부를 구분합니다.</p>
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
                <label className={labelCls}>카테고리</label>
                <div className="flex gap-1.5">
                  <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">선택하세요</option>
                    {categoryOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={openCategoryEditor}
                    title="카테고리 목록 편집"
                    className="shrink-0 px-2.5 py-2 rounded-xl border border-outline-variant text-outline hover:text-primary hover:border-primary hover:bg-primary-fixed/20 transition-colors"
                  >
                    <Settings2 size={15} />
                  </button>
                </div>
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
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5 space-y-3">
            <h3 className="font-bold text-on-surface text-sm border-b border-outline-variant/15 pb-2">업체 이미지</h3>
            <ImageUpload value={form.imageUrl ?? ''} onChange={v => setForm(prev => ({ ...prev, imageUrl: v || undefined }))} />
          </div>

          {/* 서류 이미지 */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-5 space-y-4">
            <h3 className="font-bold text-on-surface text-sm border-b border-outline-variant/15 pb-2">서류 이미지</h3>

            {/* 기존 서류 목록 */}
            {form.documents.map(doc => (
              <div key={doc.id} className="border border-outline-variant/15 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 px-3 py-1.5 border border-outline-variant rounded-lg text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    value={doc.name}
                    onChange={e => updateDoc(doc.id, { name: e.target.value })}
                    placeholder="서류 이름"
                  />
                  <button type="button" onClick={() => removeDoc(doc.id)}
                    className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <ImageUpload value={doc.imageUrl} onChange={v => updateDoc(doc.id, { imageUrl: v })} height="h-28" />
              </div>
            ))}

            {/* 새 서류 추가 */}
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="서류 이름 입력 (예: 사업자등록증)"
                value={newDocName}
                onChange={e => setNewDocName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDoc())}
              />
              <button type="button" onClick={addDoc} disabled={!newDocName.trim()}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold disabled:opacity-40">
                <Plus size={14} /> 추가
              </button>
            </div>
          </div>

          {/* 카테고리 편집 모달 */}
          {showCategoryEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
              onClick={() => setShowCategoryEditor(false)}>
              <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-xs p-5 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-on-surface text-sm">카테고리 목록 편집</h3>
                  <button onClick={() => setShowCategoryEditor(false)} className="p-1 rounded-lg hover:bg-surface-container">
                    <X size={16} className="text-on-surface-variant" />
                  </button>
                </div>

                {/* 기존 카테고리 목록 */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {catEditing.map((cat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        value={cat}
                        onChange={e => renameCatOption(i, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-outline-variant rounded-lg text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button type="button" onClick={() => removeCatOption(i)}
                        className="p-1.5 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 새 카테고리 추가 */}
                <div className="flex gap-1.5">
                  <input
                    value={newCatInput}
                    onChange={e => setNewCatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCatOption())}
                    placeholder="새 카테고리 입력"
                    className="flex-1 px-2.5 py-1.5 border border-outline-variant rounded-lg text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <button type="button" onClick={addCatOption} disabled={!newCatInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-sm font-semibold disabled:opacity-40">
                    <Plus size={14} />
                  </button>
                </div>

                {/* 저장 */}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowCategoryEditor(false)}
                    className="flex-1 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container">
                    취소
                  </button>
                  <button type="button" onClick={saveCategoryEditor}
                    className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90">
                    저장
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 저장/취소 */}
          <div className="flex gap-3 pb-8">
            <button type="button" onClick={close}
              className="flex-1 py-3 rounded-xl font-bold bg-surface-container text-on-surface hover:bg-surface-container-high">
              취소
            </button>
            <button type="button" onClick={handleSave}
              className="flex-1 py-3 rounded-xl font-bold bg-primary text-on-primary hover:opacity-90">
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
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-on-surface-variant">행사 등록 시 이 목록에서 업체를 선택할 수 있습니다.</p>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container">
            <Download size={14} /> 엑셀
          </button>
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90">
            <Plus size={15} /> 새 업체 등록
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="상호, 담당자, 연락처 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 border border-outline-variant rounded-xl text-sm text-on-surface bg-surface-container-lowest"
        >
          <option value="all">전체 카테고리</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <p className="text-sm text-on-surface-variant mb-3">총 {filteredVendors.length}건</p>

      {managedVendors.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/10 text-on-surface-variant">
          <FileImage size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">등록된 업체가 없습니다.</p>
          <button onClick={openNew} className="mt-3 text-sm font-semibold text-primary hover:underline">
            첫 번째 업체 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVendors.map(v => (
            <div key={v.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 flex items-center gap-4">
              {v.imageUrl ? (
                <img src={v.imageUrl} alt={v.name} className="w-14 h-14 object-contain rounded-xl border border-outline-variant bg-surface-container-low shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-surface-container shrink-0 flex items-center justify-center text-outline">
                  <FileImage size={22} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface truncate">{v.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{[v.category, v.phone].filter(Boolean).join(' · ')}</p>
                {v.documents.length > 0 && (
                  <p className="text-xs text-outline mt-0.5">서류 {v.documents.length}건</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEdit(v)}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => { if (confirm(`'${v.name}'을(를) 삭제할까요?`)) deleteManagedVendor(v.id); }}
                  className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
