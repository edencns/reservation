import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { getReservations } from '../utils/storage';
import { formatDate, normalizeUnitNumber } from '../utils/helpers';
import type { Reservation, CustomField } from '../types';

type Phase = 'input' | 'result' | 'notfound' | 'error';

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '동', '0', '호'];

function matchUnitNumber(stored: string, query: string): boolean {
  const s = stored.replace(/\s/g, '').toLowerCase();
  const q = query.replace(/\s/g, '').toLowerCase();
  if (!s || !q) return false;
  // Normalize both and compare
  const sNorm = normalizeUnitNumber(stored);
  const qNorm = normalizeUnitNumber(query);
  if (sNorm && qNorm && sNorm === qNorm) return true;
  // Fallback: direct include
  return s === q || s.includes(q) || q.includes(s);
}

function PrintTicket({
  reservation: r,
  extraFields,
  canvasId,
}: {
  reservation: Reservation;
  extraFields: CustomField[];
  canvasId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, r.id, {
        width: 180,
        margin: 2,
        color: { dark: '#2c3e50', light: '#ffffff' },
      });
    }
  }, [r.id]);

  const customRows = extraFields
    .filter(f => r.extraFields[f.key])
    .map(f => ({ label: f.label, value: r.extraFields[f.key] }));

  const displayName = r.customer.name || r.extraFields['name'] || '';
  const displayPhone = r.customer.phone || r.extraFields['phone'] || '';

  return (
    <div id={canvasId} className="kiosk-ticket bg-white rounded-2xl overflow-hidden" style={{ width: 340, margin: '0 auto' }}>
      <div className="text-white text-center py-4 px-5" style={{ backgroundColor: '#667EEA' }}>
        <p className="text-xs uppercase tracking-widest opacity-75 mb-1">입장권</p>
        <h2 className="font-bold text-base leading-tight">{r.eventTitle}</h2>
        {r.checkedIn && (
          <span className="inline-block mt-1 text-xs bg-green-500 text-white px-3 py-0.5 rounded-full font-semibold">
            ✓ 이미 입장완료
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl border-2 border-dashed border-gray-200">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-xs text-gray-400 mb-1">예약 번호</p>
          <p className="font-mono font-bold text-gray-700 text-xs tracking-wider break-all">{r.id.toUpperCase()}</p>
        </div>

        <div className="space-y-2 text-sm">
          {[
            { label: '장소', value: r.venue },
            { label: '날짜', value: formatDate(r.date) },
            { label: '시간', value: r.time },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-2">
              <span className="text-gray-400 shrink-0 w-16 text-xs">{label}</span>
              <span className="font-medium text-gray-700 text-right flex-1 text-sm">{value}</span>
            </div>
          ))}
          {customRows.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-2">
              <span className="text-gray-400 shrink-0 w-16 text-xs">{label}</span>
              <span className="font-medium text-gray-700 text-right flex-1 text-sm">{value}</span>
            </div>
          ))}
          {displayName && (
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-400 shrink-0 w-16 text-xs">예약자</span>
              <span className="font-medium text-gray-700 text-right flex-1 text-sm">{displayName}</span>
            </div>
          )}
          {displayPhone && (
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-400 shrink-0 w-16 text-xs">연락처</span>
              <span className="font-medium text-gray-700 text-right flex-1 text-sm">{displayPhone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 my-1">
        <div className="border-t-2 border-dashed border-gray-200" />
      </div>

      <div style={{ backgroundColor: '#E0D6F9' }} className="px-5 py-3 text-center">
        <p className="text-xs text-gray-600 font-medium">방문 시 이 QR코드를 제시해 주세요</p>
      </div>
    </div>
  );
}

export default function KioskPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getEventBySlug } = useApp();
  const event = getEventBySlug(slug ?? '');

  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [found, setFound] = useState<Reservation[]>([]);
  const [autoResetSecs, setAutoResetSecs] = useState(0);
  const [searching, setSearching] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Auto-reset countdown after result
  useEffect(() => {
    if (phase !== 'result' && phase !== 'notfound') return;
    setAutoResetSecs(15);
    const interval = setInterval(() => {
      setAutoResetSecs(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          reset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const reset = () => {
    setInput('');
    setFound([]);
    setPhase('input');
    setAutoResetSecs(0);
    setDebugInfo(null);
  };

  const handleKey = (key: string) => {
    if (key === '동' || key === '호') {
      setInput(prev => prev + key + ' ');
    } else {
      setInput(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    setInput(prev => prev.trimEnd().slice(0, -1));
  };

  const handleSearch = () => {
    if (!input.trim() || !event || searching) return;

    setSearching(true);
    try {
      // localStorage에서 직접 읽어서 항상 최신 데이터 사용
      const fresh = getReservations();

      const unitFieldKeys = event.customFields
        .filter(f => f.key === 'unitNumber' || f.label.includes('동호') || f.label.includes('호수'))
        .map(f => f.key);
      const keysToSearch = unitFieldKeys.length > 0 ? unitFieldKeys : null;

      const isThisEvent = (r: Reservation) =>
        r.eventId === event.id || r.eventTitle === event.title;

      const matchesUnit = (r: Reservation) => {
        if (keysToSearch) {
          return keysToSearch.some(k => r.extraFields[k] && matchUnitNumber(r.extraFields[k], input.trim()));
        }
        return Object.values(r.extraFields).some(v => matchUnitNumber(v, input.trim()));
      };

      const results = fresh.filter(r =>
        isThisEvent(r) && r.status !== 'cancelled' && matchesUnit(r)
      );

      // 디버그: 조회 결과 기록 (notfound일 때만 표시)
      const eventReservations = fresh.filter(isThisEvent);
      setDebugInfo(
        `API 전체: ${fresh.length}건 | 이 행사: ${eventReservations.length}건 | 입력값: "${input.trim()}" | 행사ID: ${event.id.slice(0, 8)}... | 행사명: ${event.title}` +
        (eventReservations.length > 0
          ? ` | 샘플 extraFields: ${JSON.stringify(eventReservations[0].extraFields)}`
          : '')
      );

      if (results.length === 0) {
        setPhase('notfound');
      } else {
        setFound(results);
        setPhase('result');
      }
    } catch (err) {
      setDebugInfo(`오류: ${String(err)}`);
      setPhase('error');
    } finally {
      setSearching(false);
    }
  };

  const handlePrint = () => {
    window.print();
    // Reset after a short delay (print dialog closed)
    setTimeout(reset, 800);
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="text-5xl mb-4">⚠️</p>
          <p className="text-xl font-bold">행사를 찾을 수 없습니다</p>
          <p className="text-gray-400 mt-2 text-sm">URL을 확인해주세요</p>
        </div>
      </div>
    );
  }

  const unitField = event.customFields.find(
    f => f.key === 'unitNumber' || f.label.includes('동호') || f.label.includes('호수')
  );
  const unitLabel = unitField?.label ?? '동호수';

  return (
    <div className="kiosk-root min-h-screen flex flex-col" style={{ backgroundColor: '#1a1a2e', userSelect: 'none' }}>
      {/* Print area - only visible when printing */}
      <div className="kiosk-print-only" style={{ display: 'none' }}>
        {found.map((r, i) => (
          <PrintTicket key={r.id} reservation={r} extraFields={event.customFields} canvasId={`print-ticket-${i}`} />
        ))}
      </div>

      {/* Header bar */}
      <div className="kiosk-no-print flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#667EEA' }}>
        <div>
          <p className="text-white text-xs opacity-75 uppercase tracking-widest">입장권 발급 키오스크</p>
          <p className="text-white font-bold text-lg leading-tight">{event.title}</p>
        </div>
        {(phase === 'result' || phase === 'notfound') && (
          <div className="text-right">
            <p className="text-white text-xs opacity-75">{autoResetSecs}초 후 자동 초기화</p>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="kiosk-no-print flex-1 flex items-center justify-center p-8">

        {/* INPUT PHASE */}
        {phase === 'input' && (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <p className="text-white text-2xl font-bold mb-2">{unitLabel} 입력</p>
              <p className="text-gray-400 text-sm">예약 시 입력한 {unitLabel}을 입력하세요</p>
            </div>

            {/* Display */}
            <div
              className="bg-white rounded-2xl text-center mb-6 flex items-center justify-center"
              style={{ height: 80, fontSize: input ? 36 : 22, color: input ? '#2c3e50' : '#ccc', fontWeight: 700, letterSpacing: 2 }}
            >
              {input || `${unitLabel} 입력`}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {NUMPAD_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className="rounded-xl font-bold text-xl transition-all active:scale-95"
                  style={{
                    backgroundColor: (key === '동' || key === '호') ? '#667EEA' : '#2a2a4a',
                    color: 'white',
                    height: 72,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: (key === '동' || key === '호') ? 20 : 28,
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Backspace + Search */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBackspace}
                className="rounded-xl font-bold text-xl transition-all active:scale-95"
                style={{ backgroundColor: '#3a3a5a', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}
              >
                ⌫
              </button>
              <button
                onClick={handleSearch}
                disabled={!input.trim() || searching}
                className="rounded-xl font-bold text-lg transition-all active:scale-95"
                style={{
                  backgroundColor: input.trim() && !searching ? '#48bb78' : '#2a3a2a',
                  color: 'white',
                  height: 72,
                  border: 'none',
                  cursor: input.trim() && !searching ? 'pointer' : 'not-allowed',
                  opacity: input.trim() && !searching ? 1 : 0.5,
                }}
              >
                {searching ? '조회 중...' : '입장권 출력'}
              </button>
            </div>
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && (
          <div className="w-full max-w-lg text-center">
            <div className="mb-6">
              <p className="text-green-400 text-4xl mb-2">✓</p>
              <p className="text-white text-2xl font-bold mb-1">예약을 찾았습니다</p>
              <p className="text-gray-400 text-sm">{found.length}건의 예약이 확인되었습니다</p>
            </div>

            <div className="space-y-3 mb-8 max-h-80 overflow-y-auto">
              {found.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    {r.checkedIn ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">이미 입장완료</span>
                    ) : (
                      <span className="text-xs text-white px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#667EEA' }}>예약확정</span>
                    )}
                  </div>
                  <p className="font-bold text-gray-800">{formatDate(r.date)} {r.time}</p>
                  <p className="text-sm text-gray-500">{r.venue}</p>
                  {(r.customer.name || r.extraFields['name']) && (
                    <p className="text-sm text-gray-600 mt-1">
                      예약자: <strong>{r.customer.name || r.extraFields['name']}</strong>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={reset}
                className="rounded-xl font-bold text-lg transition-all active:scale-95"
                style={{ backgroundColor: '#3a3a5a', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handlePrint}
                className="rounded-xl font-bold text-lg transition-all active:scale-95"
                style={{ backgroundColor: '#667EEA', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}
              >
                🖨️ 입장권 출력
              </button>
            </div>

            <p className="text-gray-500 text-sm mt-4">{autoResetSecs}초 후 자동으로 처음 화면으로 돌아갑니다</p>
          </div>
        )}

        {/* NOT FOUND PHASE */}
        {phase === 'notfound' && (
          <div className="w-full max-w-lg text-center">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-white text-2xl font-bold mb-2">예약을 찾을 수 없습니다</p>
            <p className="text-gray-400 mb-2">
              <strong className="text-white">"{input}"</strong> 으로 예약된 내역이 없습니다
            </p>
            <p className="text-gray-500 text-sm mb-6">동호수를 다시 확인하거나 안내데스크에 문의하세요</p>

            {debugInfo && (
              <div className="text-left bg-gray-900 rounded-xl p-3 mb-6 text-xs text-gray-400 break-all">
                <p className="text-yellow-400 font-bold mb-1">🔍 진단 정보</p>
                <p>{debugInfo}</p>
              </div>
            )}

            <button
              onClick={reset}
              className="rounded-xl font-bold text-xl w-full transition-all active:scale-95"
              style={{ backgroundColor: '#667EEA', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}
            >
              다시 입력
            </button>
            <p className="text-gray-500 text-sm mt-4">{autoResetSecs}초 후 자동으로 처음 화면으로 돌아갑니다</p>
          </div>
        )}

        {/* ERROR PHASE */}
        {phase === 'error' && (
          <div className="w-full max-w-lg text-center">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-white text-2xl font-bold mb-2">서버 연결 오류</p>
            <p className="text-gray-400 text-sm mb-6">인터넷 연결을 확인하거나 잠시 후 다시 시도하세요</p>

            {debugInfo && (
              <div className="text-left bg-gray-900 rounded-xl p-3 mb-6 text-xs text-red-400 break-all">
                <p className="text-red-400 font-bold mb-1">❌ 오류 정보</p>
                <p>{debugInfo}</p>
              </div>
            )}

            <button
              onClick={reset}
              className="rounded-xl font-bold text-xl w-full transition-all active:scale-95"
              style={{ backgroundColor: '#667EEA', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
