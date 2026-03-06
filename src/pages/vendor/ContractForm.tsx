import { useState, useRef } from 'react';
import { useOutletContext, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Upload, X, Save } from 'lucide-react';
import SignaturePad, { type SignaturePadHandle } from '../../components/SignaturePad';
import {
  getEvents, getVendorContracts, saveVendorContracts,
  getVendorPreSignature, saveVendorPreSignature, clearVendorPreSignature,
  getVendorContractTemplate,
} from '../../utils/storage';
import { generateId } from '../../utils/helpers';
import { apiSendContractSms } from '../../utils/cloudApi';
import type { ManagedVendor, VendorContract, ContractItem, TemplateField } from '../../types';
import TemplateContractEditor from './TemplateContractEditor';

const PAYMENT_OPTIONS = ['현금', '카드', '계좌이체', '기타'];

const emptyItem = (): ContractItem => ({
  id: generateId(), description: '', quantity: 1, unitPrice: 0, amount: 0,
});

export default function ContractForm() {
  const { vendor } = useOutletContext<{ vendor: ManagedVendor }>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isNew = !id;

  const allEvents = getEvents();
  const myEvents = allEvents.filter(e =>
    (e.vendors ?? []).some(v => v.managedVendorId === vendor.id)
  );

  const existing = !isNew
    ? getVendorContracts().find(c => c.id === id && c.vendorId === vendor.id)
    : undefined;

  const [contractType, setContractType] = useState<'electronic' | 'upload' | 'template'>(existing?.type ?? 'electronic');
  const vendorTemplate = getVendorContractTemplate(vendor.id);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>(existing?.templateFields ?? []);
  const [eventId, setEventId] = useState(existing?.eventId ?? searchParams.get('eventId') ?? (myEvents[0]?.id ?? ''));
  const [contractDate, setContractDate] = useState(existing?.contractDate ?? new Date().toISOString().slice(0, 10));
  const [unitNumber, setUnitNumber] = useState(existing?.unitNumber ?? '');
  const [customerName, setCustomerName] = useState(existing?.customerName ?? '');
  const [customerPhone, setCustomerPhone] = useState(existing?.customerPhone ?? '');
  const [items, setItems] = useState<ContractItem[]>(existing?.items?.length ? existing.items : [emptyItem()]);
  const [depositAmount, setDepositAmount] = useState(existing?.depositAmount ?? 0);
  const [depositInput, setDepositInput] = useState(existing?.depositAmount ? existing.depositAmount.toLocaleString() : '');
  const [paymentMethod, setPaymentMethod] = useState(existing?.paymentMethod ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [uploadedImages, setUploadedImages] = useState<string[]>(existing?.uploadedImages ?? []);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // 업체 사전 서명
  const preSig = getVendorPreSignature(vendor.id);
  const [drawNewVendorSig, setDrawNewVendorSig] = useState(!preSig && !existing?.vendorSignature);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Signature refs
  const customerSigRef = useRef<SignaturePadHandle>(null);
  const vendorSigRef = useRef<SignaturePadHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedEvent = allEvents.find(e => e.id === eventId);
  const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalAmount - depositAmount;

  const updateItem = (itemId: string, key: keyof ContractItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const updated = { ...item, [key]: value };
      if (key === 'quantity' || key === 'unitPrice') {
        updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
      }
      return updated;
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}: 파일 크기가 5MB를 초과합니다.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) setUploadedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (asDraft: boolean) => {
    if (!eventId || !unitNumber.trim() || !customerName.trim() || !customerPhone.trim()) {
      setShowErrors(true);
      return;
    }
    setSaving(true);

    // 업체 서명 결정
    let vendorSig: string | undefined;
    if (contractType === 'electronic' || contractType === 'template') {
      if (drawNewVendorSig && vendorSigRef.current && !vendorSigRef.current.isEmpty()) {
        vendorSig = vendorSigRef.current.toDataURL();
        if (saveAsDefault) saveVendorPreSignature(vendor.id, vendorSig);
      } else if (preSig) {
        vendorSig = preSig;
      } else {
        vendorSig = existing?.vendorSignature;
      }
    }

    // 고객 서명
    const customerSig = (contractType === 'electronic' || contractType === 'template') && customerSigRef.current && !customerSigRef.current.isEmpty()
      ? customerSigRef.current.toDataURL()
      : existing?.customerSignature;

    const contract: VendorContract = {
      id: existing?.id ?? generateId(),
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorCategory: vendor.category,
      eventId,
      eventTitle: selectedEvent?.title ?? '',
      unitNumber: unitNumber.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: contractType === 'electronic' ? items : [],
      totalAmount: contractType === 'electronic' ? totalAmount : 0,
      depositAmount: contractType === 'electronic' ? depositAmount : 0,
      paymentMethod,
      notes: notes.trim(),
      contractDate,
      customerSignature: customerSig,
      vendorSignature: vendorSig,
      uploadedImages: contractType === 'upload' ? uploadedImages : contractType === 'template' ? vendorTemplate : [],
      templateFields: contractType === 'template' ? templateFields : undefined,
      type: contractType,
      status: asDraft ? 'draft' : 'completed',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const all = getVendorContracts();
    if (existing) {
      saveVendorContracts(all.map(c => c.id === contract.id ? contract : c));
    } else {
      saveVendorContracts([...all, contract]);
    }

    // 완료 시 SMS 발송
    if (!asDraft && contract.customerPhone) {
      try {
        await apiSendContractSms({
          to: contract.customerPhone,
          customerName: contract.customerName,
          vendorName: vendor.name,
          vendorCategory: vendor.category,
          eventTitle: contract.eventTitle,
          unitNumber: contract.unitNumber,
          totalAmount: contract.totalAmount,
          depositAmount: contract.depositAmount,
        });
      } catch {
        // SMS 실패는 무시 (계약 저장은 완료)
      }
    }

    setSaving(false);
    navigate('/vendor/contracts');
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]';
  const errCls = (v: string) => showErrors && !v.trim() ? ' border-red-300 ring-red-200' : '';

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={22} className="text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-800 text-lg">{isNew ? '새 계약 작성' : '계약 수정'}</h2>
      </div>

      {/* 계약 유형 탭 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-600 mb-3">계약서 유형</p>
        <div className="grid grid-cols-1 gap-2">
          {([
            { value: 'electronic', label: '전자계약서', desc: '품목 입력 + 서명' },
            { value: 'template', label: '내 양식으로 계약', desc: '등록된 양식 + 서명', disabled: vendorTemplate.length === 0 },
            { value: 'upload', label: '파일 업로드', desc: '종이계약서 사진 업로드' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              type="button"
              disabled={'disabled' in opt && opt.disabled}
              onClick={() => setContractType(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                contractType === opt.value ? 'border-[#667EEA] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-bold text-gray-800">{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {opt.value === 'template' && vendorTemplate.length === 0
                  ? '양식을 먼저 등록해주세요 (계약 목록 → 계약서 양식)'
                  : opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-700 text-sm border-b pb-2">기본 정보</h3>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">행사 <span className="text-red-400">*</span></label>
          <select className={inputCls} value={eventId} onChange={e => setEventId(e.target.value)}>
            <option value="">행사를 선택하세요</option>
            {myEvents.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          {showErrors && !eventId && <p className="text-xs text-red-500 mt-1">행사를 선택해주세요.</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">계약 날짜</label>
          <input type="date" className={inputCls} value={contractDate} onChange={e => setContractDate(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">동호수 <span className="text-red-400">*</span></label>
            <input className={`${inputCls}${errCls(unitNumber)}`} placeholder="예) 101동 501호"
              value={unitNumber} onChange={e => setUnitNumber(e.target.value)} />
            {showErrors && !unitNumber.trim() && <p className="text-xs text-red-500 mt-1">필수 입력</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">고객명 <span className="text-red-400">*</span></label>
            <input className={`${inputCls}${errCls(customerName)}`} placeholder="홍길동"
              value={customerName} onChange={e => setCustomerName(e.target.value)} />
            {showErrors && !customerName.trim() && <p className="text-xs text-red-500 mt-1">필수 입력</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">고객 연락처 <span className="text-red-400">*</span></label>
          <input type="tel" className={`${inputCls}${errCls(customerPhone)}`} placeholder="010-0000-0000"
            value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          {showErrors && !customerPhone.trim() && <p className="text-xs text-red-500 mt-1">필수 입력</p>}
        </div>
      </div>

      {/* 전자계약서: 계약 내용 */}
      {contractType === 'electronic' && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-700 text-sm">계약 품목</h3>
              <button
                type="button"
                onClick={() => setItems(prev => [...prev, emptyItem()])}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90"
                style={{ backgroundColor: '#667EEA' }}
              >
                <Plus size={12} /> 품목 추가
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">품목 {idx + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                        className="p-1 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <input className={inputCls} placeholder="품목/서비스명"
                    value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">수량</label>
                      <input type="number" min={1} className={inputCls} value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">단가(원)</label>
                      <input type="number" min={0} className={inputCls} value={item.unitPrice}
                        onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">금액(원)</label>
                      <p className="px-3 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl">
                        {item.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 금액 요약 - 2열 레이아웃 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">합계금액</label>
                  <p className="px-3 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-800">
                    {totalAmount.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">계약금</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA] bg-white"
                    value={depositInput}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      const num = raw ? Number(raw) : 0;
                      setDepositAmount(num);
                      setDepositInput(raw ? num.toLocaleString() : '');
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">결제방법</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA] bg-white"
                  value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="">선택 (선택사항)</option>
                  {PAYMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                <span className="font-semibold text-gray-500">잔금</span>
                <span className="font-bold text-gray-800">{balance.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 서명 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
            <h3 className="font-bold text-gray-700 text-sm border-b pb-2">서명</h3>

            {/* 고객 서명 */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">고객 서명</p>
              {existing?.customerSignature && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">기존 서명 (새로 그리면 덮어씁니다)</p>
                  <img src={existing.customerSignature} alt="기존 고객서명"
                    className="border border-gray-100 rounded-xl h-20 object-contain bg-gray-50 w-full" />
                </div>
              )}
              <SignaturePad ref={customerSigRef} label="아래에 서명해주세요" />
            </div>

            {/* 업체 서명 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">업체 서명</p>
                {preSig && (
                  <button type="button"
                    onClick={() => setDrawNewVendorSig(v => !v)}
                    className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                    {drawNewVendorSig ? '기본 서명 사용' : '새로 그리기'}
                  </button>
                )}
              </div>

              {preSig && !drawNewVendorSig ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">사전 등록된 서명이 자동으로 사용됩니다.</p>
                  <img src={preSig} alt="업체 기본 서명"
                    className="border border-gray-100 rounded-xl h-24 object-contain bg-gray-50 w-full" />
                  <button type="button"
                    onClick={() => { clearVendorPreSignature(vendor.id); setDrawNewVendorSig(true); }}
                    className="text-xs text-red-400 hover:text-red-600">
                    기본 서명 삭제
                  </button>
                </div>
              ) : (
                <div>
                  <SignaturePad ref={vendorSigRef} label="아래에 서명해주세요" />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={saveAsDefault} onChange={e => setSaveAsDefault(e.target.checked)}
                      className="accent-[#667EEA]" />
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Save size={11} /> 이 서명을 기본 서명으로 저장
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 내 양식으로 계약 */}
      {contractType === 'template' && (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-bold text-gray-700 text-sm">계약서 작성</h3>
            <p className="text-xs text-gray-400 mt-0.5">텍스트/서명 필드를 추가한 뒤 빈칸 위치에 배치하세요</p>
          </div>
          <TemplateContractEditor
            pages={vendorTemplate}
            fields={templateFields}
            onChange={setTemplateFields}
          />
        </div>
      )}

      {/* 파일 업로드 */}
      {contractType === 'upload' && (
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2">계약서 이미지 업로드</h3>
          <p className="text-xs text-gray-400">종이 계약서를 사진으로 찍어 업로드하세요. (이미지 파일만, 최대 5MB)</p>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center cursor-pointer hover:border-[#667EEA] hover:bg-blue-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
          >
            <Upload size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">이미지를 드래그하거나 <span className="font-semibold" style={{ color: '#667EEA' }}>클릭하여 업로드</span></p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => handleImageUpload(e.target.files)} />
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt={`계약서 ${i + 1}`}
                    className="w-full rounded-xl border border-gray-100 object-cover aspect-[3/4]" />
                  <button type="button"
                    onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 메모 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <label className="block text-xs font-semibold text-gray-600 mb-2">메모 / 특이사항</label>
        <textarea className={inputCls} rows={3} placeholder="특이사항이나 메모를 입력하세요"
          value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button onClick={() => handleSave(true)} disabled={saving}
          className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 font-bold text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50">
          임시저장
        </button>
        <button onClick={() => handleSave(false)} disabled={saving}
          className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#667EEA' }}>
          {saving ? '저장 중...' : '계약 완료'}
        </button>
      </div>
    </div>
  );
}
