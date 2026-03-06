import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Move } from 'lucide-react';
import type { TemplateField } from '../../types';

const TYPE_LABEL: Record<TemplateField['type'], string> = {
  text: '텍스트',
  date: '날짜',
  amount: '금액',
  signature: '서명',
  checkbox: '체크박스',
};

const TYPE_COLOR: Record<TemplateField['type'], string> = {
  text: '#6366f1',
  date: '#10b981',
  amount: '#f59e0b',
  signature: '#ef4444',
  checkbox: '#3b82f6',
};

interface DrawState {
  startX: number;
  startY: number;
  curX: number;
  curY: number;
  pageIdx: number;
}

interface Props {
  pages: string[];
  fields: TemplateField[];
  onChange: (fields: TemplateField[]) => void;
}

export default function FieldPlacementEditor({ pages, fields, onChange }: Props) {
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const [pendingBbox, setPendingBbox] = useState<TemplateField['bbox'] | null>(null);
  const [pendingLabel, setPendingLabel] = useState('');
  const [pendingType, setPendingType] = useState<TemplateField['type']>('text');
  const [pageDims, setPageDims] = useState<{ w: number; h: number }[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelInputRef = useRef<HTMLInputElement>(null);

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

  const getRelPos = useCallback((e: React.MouseEvent, pageIdx: number) => {
    const el = pageRefs.current[pageIdx];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100)),
      y: Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100)),
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent, pageIdx: number) => {
    e.preventDefault();
    const pos = getRelPos(e, pageIdx);
    if (!pos) return;
    setDrawing({ startX: pos.x, startY: pos.y, curX: pos.x, curY: pos.y, pageIdx });
  };

  const handleMouseMove = (e: React.MouseEvent, pageIdx: number) => {
    if (!drawing || drawing.pageIdx !== pageIdx) return;
    const pos = getRelPos(e, pageIdx);
    if (!pos) return;
    setDrawing(prev => prev ? { ...prev, curX: pos.x, curY: pos.y } : null);
  };

  const handleMouseUp = (pageIdx: number) => {
    if (!drawing || drawing.pageIdx !== pageIdx) { setDrawing(null); return; }
    const x = Math.min(drawing.startX, drawing.curX);
    const y = Math.min(drawing.startY, drawing.curY);
    const w = Math.abs(drawing.curX - drawing.startX);
    const h = Math.abs(drawing.curY - drawing.startY);
    setDrawing(null);
    if (w < 2 || h < 1) return;
    setPendingBbox({ x, y, w, h, page: pageIdx });
    setPendingLabel('');
    setPendingType('text');
    setTimeout(() => labelInputRef.current?.focus(), 50);
  };

  const confirmField = () => {
    if (!pendingBbox || !pendingLabel.trim()) return;
    onChange([...fields, {
      id: `field_${Date.now()}`,
      label: pendingLabel.trim(),
      type: pendingType,
      value: '',
      bbox: pendingBbox,
    }]);
    setPendingBbox(null);
  };

  const removeField = (id: string) => onChange(fields.filter(f => f.id !== id));

  const drawRect = drawing ? {
    x: Math.min(drawing.startX, drawing.curX),
    y: Math.min(drawing.startY, drawing.curY),
    w: Math.abs(drawing.curX - drawing.startX),
    h: Math.abs(drawing.curY - drawing.startY),
  } : null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 bg-indigo-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
        <Move size={12} className="text-indigo-400 shrink-0" />
        계약서 이미지 위를 <strong>드래그</strong>해서 입력 영역을 지정하세요
      </p>

      {pages.map((img, pageIdx) => {
        const dim = pageDims[pageIdx];
        const aspectRatio = dim ? dim.h / dim.w : 1.414;
        const pageFields = fields.filter(f => f.bbox?.page === pageIdx);

        return (
          <div key={pageIdx}>
            {pages.length > 1 && (
              <p className="text-xs text-gray-400 mb-1 font-medium">{pageIdx + 1}페이지</p>
            )}
            <div
              ref={el => { pageRefs.current[pageIdx] = el; }}
              style={{
                position: 'relative',
                width: '100%',
                paddingBottom: `${aspectRatio * 100}%`,
                cursor: 'crosshair',
                userSelect: 'none',
                borderRadius: 8,
                overflow: 'hidden',
                border: '2px dashed #6366f1',
              }}
              onMouseDown={e => handleMouseDown(e, pageIdx)}
              onMouseMove={e => handleMouseMove(e, pageIdx)}
              onMouseUp={() => handleMouseUp(pageIdx)}
              onMouseLeave={() => { if (drawing?.pageIdx === pageIdx) handleMouseUp(pageIdx); }}
            >
              <img
                src={img}
                alt={`${pageIdx + 1}페이지`}
                draggable={false}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block', pointerEvents: 'none' }}
              />

              {/* 드래그 중 미리보기 */}
              {drawRect && drawing?.pageIdx === pageIdx && (
                <div style={{
                  position: 'absolute',
                  left: `${drawRect.x}%`, top: `${drawRect.y}%`,
                  width: `${drawRect.w}%`, height: `${drawRect.h}%`,
                  border: '2px solid #6366f1',
                  background: 'rgba(99,102,241,0.2)',
                  pointerEvents: 'none',
                  borderRadius: 3,
                }} />
              )}

              {/* 배치된 필드들 */}
              {pageFields.map(f => (
                <div key={f.id} style={{
                  position: 'absolute',
                  left: `${f.bbox!.x}%`, top: `${f.bbox!.y}%`,
                  width: `${f.bbox!.w}%`, height: `${f.bbox!.h}%`,
                  border: `2px solid ${TYPE_COLOR[f.type]}`,
                  background: `${TYPE_COLOR[f.type]}28`,
                  borderRadius: 3,
                }}>
                  {/* 레이블 태그 */}
                  <span style={{
                    position: 'absolute', top: -18, left: 0,
                    fontSize: 10, lineHeight: '16px',
                    background: TYPE_COLOR[f.type], color: '#fff',
                    borderRadius: '3px 3px 0 0',
                    padding: '0 4px',
                    whiteSpace: 'nowrap',
                    maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {f.label} · {TYPE_LABEL[f.type]}
                  </span>
                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); removeField(f.id); }}
                    style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#ef4444', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    <X size={10} color="white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* 배치된 필드 목록 */}
      {fields.length > 0 && (
        <div className="border border-gray-100 rounded-xl p-3 space-y-1.5 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 mb-2">배치된 필드 ({fields.length}개)</p>
          {fields.map(f => (
            <div key={f.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: TYPE_COLOR[f.type], flexShrink: 0 }} />
                <span className="text-gray-700 font-medium">{f.label}</span>
                <span className="text-gray-400">{TYPE_LABEL[f.type]}</span>
                {f.bbox && <span className="text-gray-300">{f.bbox.page + 1}p</span>}
              </div>
              <button type="button" onClick={() => removeField(f.id)}
                className="text-gray-300 hover:text-red-500 p-0.5 rounded">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 필드 설정 팝업 */}
      {pendingBbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => setPendingBbox(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5 space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm">입력 필드 설정</h3>
              <button onClick={() => setPendingBbox(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={15} className="text-gray-400" />
              </button>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">필드명</label>
              <input
                ref={labelInputRef}
                type="text"
                value={pendingLabel}
                onChange={e => setPendingLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmField(); if (e.key === 'Escape') setPendingBbox(null); }}
                placeholder="예: 성명, 계약일, 계약금액"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">타입</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.entries(TYPE_LABEL) as [TemplateField['type'], string][]).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPendingType(v)}
                    className="py-2 rounded-xl text-xs font-semibold border transition-all"
                    style={
                      pendingType === v
                        ? { backgroundColor: TYPE_COLOR[v], borderColor: TYPE_COLOR[v], color: '#fff' }
                        : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setPendingBbox(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                취소
              </button>
              <button
                type="button"
                onClick={confirmField}
                disabled={!pendingLabel.trim()}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#667EEA' }}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
