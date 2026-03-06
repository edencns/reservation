import { useRef, useState, useEffect } from 'react';
import { Plus, X, PenLine, Move } from 'lucide-react';
import SignaturePad, { type SignaturePadHandle } from '../../components/SignaturePad';
import { generateId } from '../../utils/helpers';
import type { TemplateField } from '../../types';

interface Props {
  pages: string[];
  fields: TemplateField[];
  onChange?: (fields: TemplateField[]) => void;
  readonly?: boolean;
}

const TYPE_COLOR: Record<TemplateField['type'], string> = {
  text: 'rgba(99,102,241,0.18)',
  date: 'rgba(16,185,129,0.18)',
  amount: 'rgba(245,158,11,0.18)',
  signature: 'rgba(239,68,68,0.18)',
  checkbox: 'rgba(59,130,246,0.18)',
};
const TYPE_BORDER: Record<TemplateField['type'], string> = {
  text: '#6366f1',
  date: '#10b981',
  amount: '#f59e0b',
  signature: '#ef4444',
  checkbox: '#3b82f6',
};

export default function TemplateContractEditor({ pages, fields, onChange, readonly = false }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [signingFieldId, setSigningFieldId] = useState<string | null>(null);
  const [pageDims, setPageDims] = useState<{ w: number; h: number }[]>([]);
  const sigRef = useRef<SignaturePadHandle>(null);

  // 각 페이지의 자연 크기 측정 (aspect-ratio 계산용)
  useEffect(() => {
    Promise.all(
      pages.map(
        src =>
          new Promise<{ w: number; h: number }>(resolve => {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => resolve({ w: 1, h: 1 });
            img.src = src;
          }),
      ),
    ).then(setPageDims);
  }, [pages]);

  const update = (id: string, patch: Partial<TemplateField>) =>
    onChange?.(fields.map(f => (f.id === id ? { ...f, ...patch } : f)));

  const remove = (id: string) => {
    onChange?.(fields.filter(f => f.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const confirmSig = () => {
    if (!sigRef.current || sigRef.current.isEmpty() || !signingFieldId) return;
    update(signingFieldId, { value: sigRef.current.toDataURL() });
    setSigningFieldId(null);
  };

  // bbox 없는 필드 (오버레이에 표시 안 됨)
  const unpositionedFields = fields.filter(f => !f.bbox);
  // 페이지별로 bbox 있는 필드 그룹화
  const fieldsByPage = (pageIdx: number) => fields.filter(f => f.bbox?.page === pageIdx);

  // 필드 오버레이 렌더링
  const renderOverlay = (field: TemplateField) => {
    if (!field.bbox) return null;
    const { x, y, w, h } = field.bbox;
    const isActive = activeId === field.id;
    const borderColor = TYPE_BORDER[field.type];
    const bgColor = TYPE_COLOR[field.type];

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: `${w}%`,
      minHeight: `${h}%`,
      backgroundColor: isActive ? bgColor.replace('0.18', '0.35') : bgColor,
      border: `1.5px ${isActive ? 'solid' : 'dashed'} ${borderColor}`,
      borderRadius: 4,
      cursor: readonly ? 'default' : 'pointer',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      transition: 'background 0.15s',
      zIndex: isActive ? 10 : 2,
    };

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} style={baseStyle}
          onClick={() => !readonly && update(field.id, { value: field.value === 'true' ? '' : 'true' })}>
          <input
            type="checkbox"
            checked={field.value === 'true'}
            readOnly={readonly}
            onChange={() => {}}
            style={{ pointerEvents: 'none', width: '100%', height: '100%', accentColor: borderColor }}
          />
        </div>
      );
    }

    if (field.type === 'signature') {
      return (
        <div key={field.id} style={{ ...baseStyle, flexDirection: 'column', justifyContent: 'center' }}
          onClick={() => { if (!readonly) { setActiveId(field.id); setSigningFieldId(field.id); } }}>
          {field.value ? (
            <img src={field.value} alt="서명" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '10px', color: borderColor, padding: '2px 4px', display: 'flex', alignItems: 'center', gap: 2 }}>
              <PenLine size={10} /> {field.label}
            </span>
          )}
        </div>
      );
    }

    // text / date / amount
    if (isActive && !readonly) {
      return (
        <div key={field.id} style={{ ...baseStyle, padding: '1px 3px' }}>
          {field.type === 'date' ? (
            <input type="date"
              autoFocus
              value={field.value}
              onChange={e => update(field.id, { value: e.target.value })}
              onBlur={() => setActiveId(null)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '11px', outline: 'none', color: '#1e293b' }}
            />
          ) : field.type === 'amount' ? (
            <input
              autoFocus
              type="text"
              inputMode="numeric"
              value={field.value}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                update(field.id, { value: raw ? Number(raw).toLocaleString() : '' });
              }}
              onBlur={() => setActiveId(null)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '11px', outline: 'none', color: '#1e293b' }}
              placeholder="0"
            />
          ) : (
            <input
              autoFocus
              type="text"
              value={field.value}
              onChange={e => update(field.id, { value: e.target.value })}
              onBlur={() => setActiveId(null)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '11px', outline: 'none', color: '#1e293b' }}
              placeholder={field.label}
            />
          )}
        </div>
      );
    }

    return (
      <div key={field.id} style={{ ...baseStyle, padding: '1px 4px' }}
        onClick={() => { if (!readonly) setActiveId(field.id); }}>
        <span style={{
          fontSize: '11px',
          color: field.value ? '#1e293b' : borderColor,
          fontWeight: field.value ? 600 : 400,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
        }}>
          {field.value || (readonly ? '-' : field.label)}
        </span>
        {!readonly && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); remove(field.id); }}
            style={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
          >
            <X size={9} color="white" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 범례 */}
      {!readonly && fields.some(f => f.bbox) && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {(['text', 'date', 'amount', 'signature', 'checkbox'] as TemplateField['type'][]).map(t => (
            fields.some(f => f.type === t && f.bbox) && (
              <span key={t} className="flex items-center gap-1">
                <span style={{ display: 'inline-block', width: 10, height: 10, background: TYPE_COLOR[t], border: `1px dashed ${TYPE_BORDER[t]}`, borderRadius: 2 }} />
                {t === 'text' ? '텍스트' : t === 'date' ? '날짜' : t === 'amount' ? '금액' : t === 'signature' ? '서명' : '체크박스'}
              </span>
            )
          ))}
          <span className="flex items-center gap-1 ml-1 text-gray-400">
            <Move size={10} /> 필드 클릭하여 입력
          </span>
        </div>
      )}

      {/* 페이지별 오버레이 */}
      {pages.map((img, pageIdx) => {
        const dim = pageDims[pageIdx];
        const aspectRatio = dim ? dim.h / dim.w : 1.414;
        const pageFields = fieldsByPage(pageIdx);

        return (
          <div key={pageIdx} style={{ position: 'relative', width: '100%', paddingBottom: `${aspectRatio * 100}%`, background: '#f8fafc', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img
              src={img}
              alt={`${pageIdx + 1}페이지`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
            />
            {/* 클릭 영역 차단 (읽기 전용) */}
            {pageFields.map(f => renderOverlay(f))}
          </div>
        );
      })}

      {/* bbox 없는 필드 - 폼 형태로 하단 표시 */}
      {(unpositionedFields.length > 0 || (!readonly && fields.length === 0)) && (
        <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400">
            {unpositionedFields.length > 0 ? `위치 미지정 필드 (${unpositionedFields.length}개)` : '추가 필드'}
          </p>
          {unpositionedFields.map(field => (
            <div key={field.id} className="bg-white rounded-xl border border-gray-100 p-3 space-y-2">
              {readonly ? (
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">{field.label}</span>
                  {field.type === 'checkbox' ? (
                    <input type="checkbox" checked={field.value === 'true'} readOnly />
                  ) : field.type === 'signature' ? (
                    field.value
                      ? <img src={field.value} alt="서명" className="h-10 border border-gray-100 rounded bg-white" />
                      : <span className="text-sm text-gray-300 italic">미서명</span>
                  ) : (
                    <span className="text-sm font-medium text-gray-800 break-all">
                      {field.value || <span className="text-gray-300 italic">미입력</span>}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20 shrink-0">{field.label}</span>
                  {field.type === 'checkbox' ? (
                    <input type="checkbox" checked={field.value === 'true'}
                      onChange={e => update(field.id, { value: e.target.checked ? 'true' : '' })} />
                  ) : field.type === 'signature' ? (
                    <button type="button"
                      onClick={() => { setActiveId(field.id); setSigningFieldId(field.id); }}
                      className="text-xs px-3 py-1.5 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center gap-1">
                      <PenLine size={12} />
                      {field.value ? '재서명' : '서명하기'}
                    </button>
                  ) : field.type === 'date' ? (
                    <input type="date"
                      value={field.value}
                      onChange={e => update(field.id, { value: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]" />
                  ) : field.type === 'amount' ? (
                    <input type="text" inputMode="numeric"
                      value={field.value} placeholder="0"
                      onChange={e => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        update(field.id, { value: raw ? Number(raw).toLocaleString() : '' });
                      }}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]" />
                  ) : (
                    <input type="text" value={field.value} placeholder={field.label}
                      onChange={e => update(field.id, { value: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]" />
                  )}
                  <button type="button" onClick={() => remove(field.id)}
                    className="p-1 text-gray-300 hover:text-red-500 rounded">
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {!readonly && (
            <button type="button"
              onClick={() => onChange?.([...fields, { id: generateId(), label: '추가 필드', type: 'text', value: '' }])}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-1">
              <Plus size={11} /> 필드 추가
            </button>
          )}
        </div>
      )}

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
