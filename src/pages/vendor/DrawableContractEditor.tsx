import { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, Eraser, Undo2, Trash2 } from 'lucide-react';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  tool: 'pen' | 'eraser';
}

interface PageState {
  strokes: Stroke[];
}

interface Props {
  pages: string[];                              // 원본 템플릿 이미지
  annotations?: string[];                       // 기존 필기 (저장된 merged dataUrl)
  onChange?: (pageIdx: number, dataUrl: string) => void;
  readonly?: boolean;
}

const COLORS = [
  { v: '#111827', label: '검정' },
  { v: '#1d4ed8', label: '파랑' },
  { v: '#dc2626', label: '빨강' },
  { v: '#16a34a', label: '초록' },
];
const SIZES = [
  { v: 2, label: '얇게' },
  { v: 4, label: '보통' },
  { v: 8, label: '굵게' },
];

export default function DrawableContractEditor({ pages, annotations, onChange, readonly = false }: Props) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [pageStates, setPageStates] = useState<PageState[]>(pages.map(() => ({ strokes: [] })));
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#111827');
  const [size, setSize] = useState(4);
  const [activePageIdx, setActivePageIdx] = useState<number | null>(null);
  const currentStroke = useRef<Stroke | null>(null);
  const isDrawing = useRef(false);

  // 이미지 로드 + 캔버스 초기화
  useEffect(() => {
    pages.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        imgRefs.current[i] = img;
        const canvas = canvasRefs.current[i];
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        // 기존 필기가 있으면 그걸 그림, 없으면 원본 이미지
        if (annotations?.[i]) {
          const ann = new Image();
          ann.onload = () => ctx.drawImage(ann, 0, 0);
          ann.src = annotations[i];
        } else {
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = src;
    });
  }, [pages]);

  const getPos = useCallback((e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = 'touches' in e ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  }, []);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const redrawCanvas = useCallback((pageIdx: number, strokes: Stroke[]) => {
    const canvas = canvasRefs.current[pageIdx];
    const img = imgRefs.current[pageIdx];
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    strokes.forEach(s => drawStroke(ctx, s));
  }, []);

  const exportCanvas = useCallback((pageIdx: number) => {
    const canvas = canvasRefs.current[pageIdx];
    if (!canvas) return;
    onChange?.(pageIdx, canvas.toDataURL('image/jpeg', 0.92));
  }, [onChange]);

  const startDraw = useCallback((e: MouseEvent | TouchEvent, pageIdx: number) => {
    if (readonly) return;
    e.preventDefault();
    const canvas = canvasRefs.current[pageIdx];
    if (!canvas) return;
    const pos = getPos(e, canvas);
    isDrawing.current = true;
    setActivePageIdx(pageIdx);
    currentStroke.current = { points: [pos], color, size: tool === 'eraser' ? size * 4 : size, tool };

    const ctx = canvas.getContext('2d')!;
    ctx.save();
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'eraser' ? size * 4 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.restore();
  }, [readonly, color, size, tool, getPos]);

  const continueDraw = useCallback((e: MouseEvent | TouchEvent, pageIdx: number) => {
    if (!isDrawing.current || !currentStroke.current) return;
    e.preventDefault();
    const canvas = canvasRefs.current[pageIdx];
    if (!canvas) return;
    const pos = getPos(e, canvas);
    currentStroke.current.points.push(pos);

    const ctx = canvas.getContext('2d')!;
    const pts = currentStroke.current.points;
    ctx.save();
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === 'eraser' ? size * 4 : size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.restore();
  }, [color, size, tool, getPos]);

  const endDraw = useCallback((pageIdx: number) => {
    if (!isDrawing.current || !currentStroke.current) return;
    isDrawing.current = false;
    const stroke = currentStroke.current;
    currentStroke.current = null;
    if (stroke.points.length < 2) return;

    setPageStates(prev => {
      const next = prev.map((ps, i) =>
        i === pageIdx ? { strokes: [...ps.strokes, stroke] } : ps
      );
      return next;
    });
    exportCanvas(pageIdx);
  }, [exportCanvas]);

  const undo = (pageIdx: number) => {
    setPageStates(prev => {
      const newStrokes = prev[pageIdx].strokes.slice(0, -1);
      const next = prev.map((ps, i) => i === pageIdx ? { strokes: newStrokes } : ps);
      redrawCanvas(pageIdx, newStrokes);
      setTimeout(() => exportCanvas(pageIdx), 0);
      return next;
    });
  };

  const clearPage = (pageIdx: number) => {
    setPageStates(prev => {
      const next = prev.map((ps, i) => i === pageIdx ? { strokes: [] } : ps);
      redrawCanvas(pageIdx, []);
      setTimeout(() => exportCanvas(pageIdx), 0);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* 도구 모음 */}
      {!readonly && (
        <div className="flex items-center gap-3 flex-wrap bg-gray-50 rounded-xl px-3 py-2.5">
          {/* 펜/지우개 */}
          <div className="flex gap-1">
            <button type="button" onClick={() => setTool('pen')}
              className="p-2 rounded-lg transition-all"
              style={tool === 'pen' ? { backgroundColor: '#667EEA', color: '#fff' } : { color: '#6b7280' }}>
              <Pen size={15} />
            </button>
            <button type="button" onClick={() => setTool('eraser')}
              className="p-2 rounded-lg transition-all"
              style={tool === 'eraser' ? { backgroundColor: '#667EEA', color: '#fff' } : { color: '#6b7280' }}>
              <Eraser size={15} />
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* 색상 */}
          {tool === 'pen' && (
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button key={c.v} type="button" onClick={() => setColor(c.v)}
                  title={c.label}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', background: c.v,
                    border: color === c.v ? '3px solid #667EEA' : '2px solid #e5e7eb',
                    cursor: 'pointer',
                  }} />
              ))}
            </div>
          )}

          {tool === 'pen' && <div className="w-px h-5 bg-gray-200" />}

          {/* 굵기 */}
          <div className="flex gap-1">
            {SIZES.map(s => (
              <button key={s.v} type="button" onClick={() => setSize(s.v)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                style={size === s.v
                  ? { backgroundColor: '#667EEA', color: '#fff' }
                  : { backgroundColor: '#e5e7eb', color: '#6b7280' }}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-1">
            {activePageIdx !== null && (
              <>
                <button type="button" onClick={() => undo(activePageIdx)}
                  disabled={pageStates[activePageIdx]?.strokes.length === 0}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition-all" title="실행 취소">
                  <Undo2 size={15} />
                </button>
                <button type="button" onClick={() => clearPage(activePageIdx)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all" title="페이지 초기화">
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 페이지들 */}
      {pages.map((_, pageIdx) => (
        <div key={pageIdx}>
          {pages.length > 1 && (
            <p className="text-xs text-gray-400 mb-1 font-medium">{pageIdx + 1}페이지</p>
          )}
          <div style={{ position: 'relative', lineHeight: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <canvas
              ref={el => { canvasRefs.current[pageIdx] = el; }}
              style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none', cursor: readonly ? 'default' : tool === 'eraser' ? 'cell' : 'crosshair' }}
              onMouseDown={e => startDraw(e.nativeEvent, pageIdx)}
              onMouseMove={e => continueDraw(e.nativeEvent, pageIdx)}
              onMouseUp={() => endDraw(pageIdx)}
              onMouseLeave={() => { if (isDrawing.current) endDraw(pageIdx); }}
              onTouchStart={e => startDraw(e.nativeEvent, pageIdx)}
              onTouchMove={e => continueDraw(e.nativeEvent, pageIdx)}
              onTouchEnd={() => endDraw(pageIdx)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
