import { useState, useRef } from 'react';
import { Trash2, Type, PenLine, X } from 'lucide-react';
import SignaturePad, { type SignaturePadHandle } from '../../components/SignaturePad';
import { generateId } from '../../utils/helpers';
import type { TemplateField } from '../../types';

interface Props {
  pages: string[];
  fields: TemplateField[];
  onChange: (fields: TemplateField[]) => void;
  readonly?: boolean;
}

export default function TemplateContractEditor({ pages, fields, onChange, readonly = false }: Props) {
  const [addMode, setAddMode] = useState<'text' | 'signature' | null>(null);
  const [signingFieldId, setSigningFieldId] = useState<string | null>(null);
  const sigRef = useRef<SignaturePadHandle>(null);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (!addMode || readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newField: TemplateField = {
      id: generateId(),
      pageIndex,
      x,
      y,
      type: addMode,
      value: '',
    };
    onChange([...fields, newField]);
    setAddMode(null);
  };

  const updateField = (id: string, value: string) =>
    onChange(fields.map(f => f.id === id ? { ...f, value } : f));

  const removeField = (id: string) =>
    onChange(fields.filter(f => f.id !== id));

  const confirmSig = () => {
    if (!sigRef.current || sigRef.current.isEmpty() || !signingFieldId) return;
    updateField(signingFieldId, sigRef.current.toDataURL());
    setSigningFieldId(null);
  };

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      {!readonly && (
        <div className="flex items-center gap-2 flex-wrap p-3 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-xs font-semibold text-gray-500 mr-1">필드 추가:</span>
          <button
            type="button"
            onClick={() => setAddMode(addMode === 'text' ? null : 'text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              addMode === 'text' ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
            style={addMode === 'text' ? { backgroundColor: '#667EEA' } : {}}
          >
            <Type size={13} /> 텍스트
          </button>
          <button
            type="button"
            onClick={() => setAddMode(addMode === 'signature' ? null : 'signature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              addMode === 'signature' ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
            }`}
            style={addMode === 'signature' ? { backgroundColor: '#667EEA' } : {}}
          >
            <PenLine size={13} /> 서명
          </button>
          {addMode ? (
            <span className="text-xs font-semibold ml-1" style={{ color: '#667EEA' }}>
              ▶ 양식에서 원하는 위치를 클릭하세요
            </span>
          ) : (
            <span className="text-xs text-gray-400 ml-1">버튼 선택 후 양식 위 원하는 위치 클릭</span>
          )}
        </div>
      )}

      {/* 페이지별 렌더링 */}
      {pages.map((pageImg, pageIndex) => {
        const pageFields = fields.filter(f => f.pageIndex === pageIndex);
        return (
          <div key={pageIndex} className="space-y-1">
            <p className="text-xs text-gray-400 text-center">{pageIndex + 1} / {pages.length} 페이지</p>
            <div
              className={`relative select-none ${!readonly && addMode ? 'cursor-crosshair ring-2 ring-indigo-300 ring-offset-1 rounded-xl' : ''}`}
              onClick={(e) => handlePageClick(e, pageIndex)}
            >
              <img
                src={pageImg}
                alt={`양식 ${pageIndex + 1}페이지`}
                className="w-full rounded-xl border border-gray-200"
                draggable={false}
              />

              {/* 필드 오버레이 */}
              {pageFields.map(field => (
                <div
                  key={field.id}
                  className="absolute"
                  style={{ left: `${field.x}%`, top: `${field.y}%`, transform: 'translateY(-50%)', zIndex: 10 }}
                  onClick={e => e.stopPropagation()}
                >
                  {field.type === 'text' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={field.value}
                        onChange={e => updateField(field.id, e.target.value)}
                        placeholder="입력"
                        readOnly={readonly}
                        className="border-b-2 border-[#667EEA] bg-white/80 text-sm px-1 py-0.5 outline-none min-w-[80px] max-w-[180px] rounded-sm"
                      />
                      {!readonly && (
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shrink-0"
                        >
                          <X size={9} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {field.value ? (
                        <>
                          <img src={field.value} alt="서명" className="h-10 border border-gray-200 rounded bg-white/90 shadow-sm" />
                          {!readonly && (
                            <>
                              <button
                                type="button"
                                onClick={() => { updateField(field.id, ''); setSigningFieldId(field.id); }}
                                className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 hover:text-gray-700 shadow-sm"
                              >재서명</button>
                              <button
                                type="button"
                                onClick={() => removeField(field.id)}
                                className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shrink-0"
                              >
                                <X size={9} />
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => !readonly && setSigningFieldId(field.id)}
                            className="text-xs px-2.5 py-1 bg-white/90 border-2 border-dashed border-[#667EEA] rounded text-indigo-600 font-semibold hover:bg-blue-50 shadow-sm"
                          >
                            ✍ 서명
                          </button>
                          {!readonly && (
                            <button
                              type="button"
                              onClick={() => removeField(field.id)}
                              className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shrink-0"
                            >
                              <X size={9} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {fields.length === 0 && !readonly && (
        <p className="text-xs text-gray-400 text-center py-2">위 버튼으로 텍스트 또는 서명 필드를 추가하세요</p>
      )}

      {/* 서명 모달 */}
      {signingFieldId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSigningFieldId(null)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">서명</h3>
              <button onClick={() => setSigningFieldId(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <SignaturePad ref={sigRef} label="아래에 서명해주세요" />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setSigningFieldId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
              >취소</button>
              <button
                type="button"
                onClick={confirmSig}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: '#667EEA' }}
              >확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 사용되지 않는 import 방지용 */}
      <span className="hidden"><Trash2 size={0} /></span>
    </div>
  );
}
