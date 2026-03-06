import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

const SignaturePad = forwardRef<SignaturePadHandle, { label?: string }>(({ label }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const c = canvasRef.current;
      if (!c) return;
      c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
      setEmpty(true);
    },
    isEmpty: () => empty,
    toDataURL: () => canvasRef.current?.toDataURL() ?? '',
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      const src = 'touches' in e ? e.touches[0] : e;
      return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      const { x, y } = pos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const move = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!drawing.current) return;
      const { x, y } = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      setEmpty(false);
    };
    const end = () => { drawing.current = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('mouseleave', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
    };
  }, []);

  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-gray-500">{label}</p>}
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        className="w-full border border-gray-200 rounded-xl bg-white touch-none cursor-crosshair"
        style={{ height: '120px' }}
      />
      <button
        type="button"
        onClick={() => {
          const c = canvasRef.current;
          if (!c) return;
          c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
          setEmpty(true);
        }}
        className="text-xs text-gray-400 hover:text-gray-600 underline"
      >
        지우기
      </button>
    </div>
  );
});

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
