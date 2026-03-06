import { useRef, useState } from 'react';
import { Plus, Trash2, X, PenLine } from 'lucide-react';
import SignaturePad, { type SignaturePadHandle } from '../../components/SignaturePad';
import { generateId } from '../../utils/helpers';
import type { TemplateField } from '../../types';

const TYPE_LABELS: Record<TemplateField['type'], string> = {
  text: '텍스트',
  date: '날짜',
  amount: '금액',
  signature: '서명',
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS) as [TemplateField['type'], string][];

interface Props {
  pages: string[];
  fields: TemplateField[];
  onChange?: (fields: TemplateField[]) => void;
  readonly?: boolean;
}

export default function TemplateContractEditor({ pages, fields, onChange, readonly = false }: Props) {
  const [signingFieldId, setSigningFieldId] = useState<string | null>(null);
  const sigRef = useRef<SignaturePadHandle>(null);

  const update = (id: string, patch: Partial<TemplateField>) =>
    onChange?.(fields.map(f => f.id === id ? { ...f, ...patch } : f));

  const remove = (id: string) =>
    onChange?.(fields.filter(f => f.id !== id));

  const addField = () =>
    onChange?.([...fields, { id: generateId(), label: '', type: 'text', value: '' }]);

  const confirmSig = () => {
    if (!sigRef.current || sigRef.current.isEmpty() || !signingFieldId) return;
    update(signingFieldId, { value: sigRef.current.toDataURL() });
    setSigningFieldId(null);
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA] bg-white';

  return (
    <div className="space-y-5">
      {/* 양식 이미지 미리보기 */}
      {pages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500">계약서 양식 원본</p>
          <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50">
            {pages.map((img, i) => (
              <img key={i} src={img} alt={`양식 ${i + 1}페이지`}
                className="w-full rounded-lg border border-gray-200 object-contain" />
            ))}
          </div>
        </div>
      )}

      {/* 필드 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">
            {readonly ? '작성 내용' : '입력 필드'}
          </p>
          {!readonly && (
            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <Plus size={12} /> 필드 추가
            </button>
          )}
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            {readonly ? '작성된 내용이 없습니다.' : 'AI 분석 후 필드가 자동 생성됩니다.'}
          </p>
        )}

        <div className="space-y-2">
          {fields.map(field => (
            <div key={field.id} className={`rounded-xl border ${readonly ? 'border-gray-100 bg-gray-50 p-3' : 'border-gray-200 bg-white p-3'}`}>
              {readonly ? (
                /* 읽기 전용 */
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">{field.label}</span>
                  {field.type === 'signature' ? (
                    field.value
                      ? <img src={field.value} alt="서명" className="h-12 border border-gray-200 rounded bg-white object-contain" />
                      : <span className="text-sm text-gray-300 italic">미서명</span>
                  ) : (
                    <span className="text-sm font-medium text-gray-800 break-all">
                      {field.value || <span className="text-gray-300 italic">미입력</span>}
                    </span>
                  )}
                </div>
              ) : (
                /* 편집 모드 */
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={e => update(field.id, { label: e.target.value })}
                      placeholder="필드명 (예: 고객명)"
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                    />
                    <select
                      value={field.type}
                      onChange={e => update(field.id, { type: e.target.value as TemplateField['type'], value: '' })}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#667EEA] bg-white"
                    >
                      {TYPE_OPTIONS.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => remove(field.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* 입력 */}
                  {field.type === 'signature' ? (
                    <div>
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          <img src={field.value} alt="서명" className="h-12 border border-gray-200 rounded bg-gray-50 object-contain" />
                          <button type="button" onClick={() => { update(field.id, { value: '' }); setSigningFieldId(field.id); }}
                            className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                            재서명
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSigningFieldId(field.id)}
                          className="flex items-center gap-1.5 text-sm px-4 py-2 border-2 border-dashed border-[#667EEA] rounded-xl text-indigo-600 font-semibold hover:bg-blue-50 w-full justify-center"
                        >
                          <PenLine size={15} /> 서명하기
                        </button>
                      )}
                    </div>
                  ) : field.type === 'date' ? (
                    <input type="date" className={inputCls} value={field.value}
                      onChange={e => update(field.id, { value: e.target.value })} />
                  ) : field.type === 'amount' ? (
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        className={inputCls}
                        value={field.value}
                        placeholder="0"
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          update(field.id, { value: raw ? Number(raw).toLocaleString() : '' });
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
                    </div>
                  ) : (
                    <input type="text" className={inputCls} value={field.value}
                      placeholder={`${field.label || '내용'} 입력`}
                      onChange={e => update(field.id, { value: e.target.value })} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 서명 모달 */}
      {signingFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSigningFieldId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">서명</h3>
              <button onClick={() => setSigningFieldId(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <SignaturePad ref={sigRef} label="아래에 서명해주세요" />
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => setSigningFieldId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">취소</button>
              <button type="button" onClick={confirmSig}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: '#667EEA' }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
