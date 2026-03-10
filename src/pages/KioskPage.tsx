import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiGetReservations } from '../utils/cloudApi';
import { getReservations } from '../utils/storage';
import { formatDate, normalizeUnitNumber } from '../utils/helpers';
import type { Event, Reservation } from '../types';

type Phase = 'input' | 'result' | 'alreadyprinted' | 'notfound' | 'error';

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '동', '0', '호'];
const REPRINT_CODE = '12345';

const TICKET_LOGO_URL = '/logo.png';

function raffleNumber(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return String(h % 1000000).padStart(6, '0');
}

function matchUnitNumber(stored: string, query: string): boolean {
  const s = stored.replace(/\s/g, '').toLowerCase();
  const q = query.replace(/\s/g, '').toLowerCase();
  if (!s || !q) return false;
  const sNorm = normalizeUnitNumber(stored);
  const qNorm = normalizeUnitNumber(query);
  if (sNorm && qNorm && sNorm === qNorm) return true;
  return s === q || s.includes(q) || q.includes(s);
}

function buildTicketHtml(reservations: Reservation[], event: Event, logoUrl?: string): string {
  const SEP = '----------------------------------------';

  const rows = reservations.map((r) => {
    const customRows = event.customFields
      .filter(f => r.extraFields[f.key])
      .map(f => `<div class="row"><span class="lbl">${f.label}</span><span class="val">${r.extraFields[f.key]}</span></div>`)
      .join('');

    const name = r.customer.name || r.extraFields['name'] || '';
    const phone = r.customer.phone || r.extraFields['phone'] || '';
    const raffle = raffleNumber(r.id);

    return `
      <div class="ticket">
        ${logoUrl ? `<div class="center logo-wrap"><img src="${logoUrl}" class="logo" alt="logo"/></div>` : ''}
        <div class="center">
          <div class="title-sub">[ 입  장  권 ]</div>
          <div class="title-main">${r.eventTitle}</div>
        </div>
        <div class="sep">${SEP}</div>
        <div class="rows">
          <div class="row"><span class="lbl">장소</span><span class="val">${r.venue}</span></div>
          <div class="row"><span class="lbl">날짜</span><span class="val">${formatDate(r.date)}</span></div>
          ${r.time && r.time !== '시간 미지정' ? `<div class="row"><span class="lbl">시간</span><span class="val">${r.time}</span></div>` : ''}
          ${name ? `<div class="row"><span class="lbl">예약자</span><span class="val">${name}</span></div>` : ''}
          ${phone ? `<div class="row"><span class="lbl">연락처</span><span class="val">${phone}</span></div>` : ''}
          ${customRows}
        </div>
        <div class="sep">${SEP}</div>
        <div class="raffle-box">
          <div class="raffle-label">[ 응  모  권 ]</div>
          <div class="raffle-num">${raffle}</div>
        </div>
        <div class="sep">${SEP}</div>
        <div class="center small">NO. ${r.id.toUpperCase()}</div>
      </div>`;
  });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <title>입장권</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 72mm;
      font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
      font-size: 12pt;
      color: #000;
      background: #fff;
    }
    .ticket { width: 72mm; padding: 3mm 0; }
    .center { text-align: center; padding: 2mm 0; }
    .title-sub { font-size: 11pt; letter-spacing: 3px; margin-bottom: 3mm; }
    .title-main { font-size: 15pt; font-weight: 900; line-height: 1.4; word-break: keep-all; }
    .sep { font-size: 8pt; color: #000; letter-spacing: -1px; overflow: hidden; line-height: 1; padding: 2mm 0; }
    .rows { padding: 1mm 0; }
    .row { display: flex; align-items: flex-start; padding: 2mm 0; }
    .lbl { font-size: 11pt; min-width: 18mm; flex-shrink: 0; color: #333; }
    .val { font-size: 12pt; font-weight: 700; flex: 1; word-break: keep-all; line-height: 1.4; }
    .small { font-size: 8pt; color: #555; padding: 2mm 0; word-break: break-all; }
    .logo-wrap { padding: 4mm 0 3mm; }
    .logo { max-width: 64mm; max-height: 30mm; object-fit: contain; }
    .raffle-box { text-align: center; padding: 3mm 0; }
    .raffle-label { font-size: 10pt; letter-spacing: 3px; margin-bottom: 2mm; }
    .raffle-num { font-size: 28pt; font-weight: 900; letter-spacing: 6px; line-height: 1.2; }
    @media print {
      @page { size: 80mm auto; margin: 4mm 4mm; }
      html, body { width: 72mm; }
    }
  </style>
</head>
<body>
  ${rows.join('')}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 500);
      }, 300);
    };
  </script>
</body>
</html>`;
}

// ── 재출력 팝업 내부 Numpad ──────────────────────────────────────────────
function ReprintNumpad({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const append = (key: string) => {
    if (key === '동' || key === '호') onChange(value + key + ' ');
    else onChange(value + key);
  };
  const backspace = () => onChange(value.trimEnd().slice(0, -1));

  return (
    <div>
      <div
        className="bg-white rounded-xl text-center mb-4 flex items-center justify-center"
        style={{ height: 64, fontSize: value ? 28 : 18, color: value ? '#2c3e50' : '#ccc', fontWeight: 700, letterSpacing: 2 }}
      >
        {value || '동호수 입력'}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {NUMPAD_KEYS.map(key => (
          <button
            key={key}
            onClick={() => append(key)}
            className="rounded-xl font-bold transition-all active:scale-95"
            style={{
              backgroundColor: (key === '동' || key === '호') ? '#667EEA' : '#2a2a4a',
              color: 'white', height: 58, border: 'none', cursor: 'pointer',
              fontSize: (key === '동' || key === '호') ? 17 : 24,
            }}
          >
            {key}
          </button>
        ))}
      </div>
      <button
        onClick={backspace}
        className="w-full rounded-xl font-bold text-xl transition-all active:scale-95"
        style={{ backgroundColor: '#3a3a5a', color: 'white', height: 52, border: 'none', cursor: 'pointer' }}
      >
        ⌫
      </button>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────
export default function KioskPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getEventBySlug, getEventById, checkIn } = useApp();
  const event = getEventBySlug(slug ?? '') ?? getEventById(slug ?? '');

  // 메인 상태
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [found, setFound] = useState<Reservation[]>([]);
  const [autoResetSecs, setAutoResetSecs] = useState(0);
  const [searching, setSearching] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // 재출력 팝업 상태
  const [showReprint, setShowReprint] = useState(false);
  const [reprintInput, setReprintInput] = useState('');
  const [reprintFound, setReprintFound] = useState<Reservation[]>([]);
  const [reprintPhase, setReprintPhase] = useState<'input' | 'result' | 'notfound'>('input');
  const [reprintSearching, setReprintSearching] = useState(false);

  useEffect(() => {
    if (phase !== 'result' && phase !== 'notfound' && phase !== 'alreadyprinted') return;
    setAutoResetSecs(15);
    const interval = setInterval(() => {
      setAutoResetSecs(prev => {
        if (prev <= 1) { clearInterval(interval); reset(); return 0; }
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

  const closeReprint = () => {
    setShowReprint(false);
    setReprintInput('');
    setReprintFound([]);
    setReprintPhase('input');
  };

  const handleKey = (key: string) => {
    if (key === '동' || key === '호') setInput(prev => prev + key + ' ');
    else setInput(prev => prev + key);
  };

  const handleBackspace = () => setInput(prev => prev.trimEnd().slice(0, -1));

  // 공통 검색 함수
  const searchReservations = async (query: string, includeCheckedIn: boolean) => {
    let fromApi: Reservation[] = [];
    let apiError = '';
    try { fromApi = await apiGetReservations(); } catch (e) { apiError = String(e); }
    const fromLocal = getReservations();
    const apiIds = new Set(fromApi.map(r => r.id));
    const fresh = [...fromApi, ...fromLocal.filter(r => !apiIds.has(r.id))];

    const unitFieldKeys = event!.customFields
      .filter(f => f.key === 'unitNumber' || f.label.includes('동호') || f.label.includes('호수'))
      .map(f => f.key);
    const keysToSearch = unitFieldKeys.length > 0 ? unitFieldKeys : null;

    const isThisEvent = (r: Reservation) => r.eventId === event!.id || r.eventTitle === event!.title;
    const matchesUnit = (r: Reservation) => {
      if (keysToSearch) return keysToSearch.some(k => r.extraFields[k] && matchUnitNumber(r.extraFields[k], query));
      return Object.values(r.extraFields).some(v => matchUnitNumber(v, query));
    };

    const results = fresh.filter(r =>
      isThisEvent(r) &&
      r.status !== 'cancelled' &&
      matchesUnit(r) &&
      (includeCheckedIn || true) // 항상 전체 포함, 이후 단계에서 분기
    );

    const eventReservations = fresh.filter(isThisEvent);
    return { results, fresh, eventReservations, apiError };
  };

  const handleSearch = async () => {
    if (!input.trim() || !event || searching) return;

    // 재출력 코드 감지
    if (input.trim() === REPRINT_CODE) {
      setShowReprint(true);
      setReprintInput('');
      setReprintPhase('input');
      setReprintFound([]);
      setInput('');
      return;
    }

    setSearching(true);
    try {
      const { results, eventReservations, apiError } = await searchReservations(input.trim(), true);

      setDebugInfo(
        `이 행사: ${eventReservations.length}건 | 입력: "${input.trim()}"` +
        (apiError ? ` | API오류: ${apiError}` : '')
      );

      if (results.length === 0) {
        setPhase('notfound');
      } else if (results.every(r => r.checkedIn)) {
        // 전부 이미 출력된 경우 → 재출력 불가 안내
        setFound(results);
        setPhase('alreadyprinted');
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

  // 재출력 팝업용 검색
  const handleReprintSearch = async () => {
    if (!reprintInput.trim() || !event || reprintSearching) return;
    setReprintSearching(true);
    try {
      const { results } = await searchReservations(reprintInput.trim(), true);
      // 이미 발급된(checkedIn) 것만 재출력 허용
      const issued = results.filter(r => r.checkedIn);
      if (issued.length === 0) {
        setReprintPhase('notfound');
      } else {
        setReprintFound(issued);
        setReprintPhase('result');
      }
    } catch {
      setReprintPhase('notfound');
    } finally {
      setReprintSearching(false);
    }
  };

  const doPrint = async (reservations: Reservation[], markCheckIn: boolean) => {
    if (!event || printing) return;
    setPrinting(true);
    try {
      // 출력 전 미체크인 예약 체크인 처리
      if (markCheckIn) {
        for (const r of reservations) {
          if (!r.checkedIn) checkIn(r.id);
        }
      }
      const logoUrl = TICKET_LOGO_URL ? window.location.origin + TICKET_LOGO_URL : '';
      const html = buildTicketHtml(reservations, event, logoUrl);
      const popup = window.open('', '_blank', 'width=340,height=600,menubar=no,toolbar=no,location=no,status=no');
      if (!popup) window.print();
      else { popup.document.write(html); popup.document.close(); }
      setTimeout(() => {
        closeReprint();
        reset();
      }, 1000);
    } finally {
      setPrinting(false);
    }
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#1a1a2e', userSelect: 'none' }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#667EEA' }}>
        <p className="text-white text-sm font-semibold tracking-widest uppercase opacity-90">입장권 발급 키오스크</p>
        {(phase === 'result' || phase === 'notfound' || phase === 'alreadyprinted') && (
          <p className="text-white text-sm opacity-75">{autoResetSecs}초 후 자동 초기화</p>
        )}
      </div>

      {/* 메인 */}
      <div className="flex-1 flex flex-col p-8">

        {/* 입력 화면 */}
        {phase === 'input' && (
          <div className="flex-1 flex flex-col items-center justify-center pb-56">
            {/* 행사명 */}
            <div className="text-center mb-28 px-4">
              <p className="text-5xl font-extrabold text-white leading-tight" style={{ wordBreak: 'keep-all' }}>{event.title}</p>
              {event.venue && <p className="text-gray-400 text-lg mt-5">{event.venue}</p>}
            </div>

            {/* 넘패드 */}
            <div className="w-full max-w-md">
                <p className="text-white text-lg font-bold text-center mb-4">예약 시 입력한 {unitLabel}을 입력하세요</p>

                <div
                  className="bg-white rounded-2xl text-center mb-6 flex items-center justify-center"
                  style={{ height: 80, fontSize: input ? 36 : 22, color: input ? '#2c3e50' : '#ccc', fontWeight: 700, letterSpacing: 2 }}
                >
                  {input || `${unitLabel} 입력`}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  {NUMPAD_KEYS.map(key => (
                    <button
                      key={key}
                      onClick={() => handleKey(key)}
                      className="rounded-xl font-bold transition-all active:scale-95"
                      style={{
                        backgroundColor: (key === '동' || key === '호') ? '#667EEA' : '#2a2a4a',
                        color: 'white', height: 72, border: 'none', cursor: 'pointer',
                        fontSize: (key === '동' || key === '호') ? 20 : 28,
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>

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
                      color: 'white', height: 72, border: 'none',
                      cursor: input.trim() && !searching ? 'pointer' : 'not-allowed',
                      opacity: input.trim() && !searching ? 1 : 0.5,
                    }}
                  >
                    {searching ? '조회 중...' : '입장권 출력'}
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* 결과 화면 — 미출력 예약 있음 */}
        {phase === 'result' && (
          <div className="w-full max-w-lg text-center my-auto">
            <p className="text-green-400 text-4xl mb-2">✓</p>
            <p className="text-white text-2xl font-bold mb-1">예약을 찾았습니다</p>
            <p className="text-gray-400 text-sm mb-6">{found.length}건의 예약이 확인되었습니다</p>

            <div className="space-y-3 mb-8 max-h-72 overflow-y-auto">
              {found.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    {r.checkedIn
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">이미 입장완료</span>
                      : <span className="text-xs text-white px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#667EEA' }}>예약확정</span>
                    }
                  </div>
                  <p className="font-bold text-gray-800">{formatDate(r.date)}{r.time && r.time !== '시간 미지정' ? ` ${r.time}` : ''}</p>
                  <p className="text-sm text-gray-500">{r.venue}</p>
                  {(r.customer.name || r.extraFields['name']) && (
                    <p className="text-sm text-gray-600 mt-1">예약자: <strong>{r.customer.name || r.extraFields['name']}</strong></p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={reset}
                className="rounded-xl font-bold text-lg transition-all active:scale-95"
                style={{ backgroundColor: '#3a3a5a', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}>
                취소
              </button>
              <button onClick={() => doPrint(found.filter(r => !r.checkedIn), true)} disabled={printing}
                className="rounded-xl font-bold text-lg transition-all active:scale-95"
                style={{ backgroundColor: printing ? '#4a5a8a' : '#667EEA', color: 'white', height: 72, border: 'none', cursor: printing ? 'not-allowed' : 'pointer' }}>
                {printing ? '출력 준비 중...' : '🖨️ 입장권 출력'}
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-4">{autoResetSecs}초 후 자동으로 처음 화면으로 돌아갑니다</p>
          </div>
        )}

        {/* 이미 출력 완료 화면 */}
        {phase === 'alreadyprinted' && (
          <div className="w-full max-w-lg text-center my-auto">
            <p className="text-yellow-400 text-5xl mb-4">🎫</p>
            <p className="text-white text-2xl font-bold mb-2">이미 발급된 입장권입니다</p>
            <p className="text-gray-400 mb-2"><strong className="text-white">"{input}"</strong> 으로 입장권이 이미 발급되었습니다</p>
            <p className="text-gray-500 text-sm mb-8">재출력이 필요하면 안내데스크에 문의하세요</p>
            <button onClick={reset}
              className="rounded-xl font-bold text-xl w-full transition-all active:scale-95"
              style={{ backgroundColor: '#667EEA', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}>
              처음으로
            </button>
            <p className="text-gray-500 text-sm mt-4">{autoResetSecs}초 후 자동으로 처음 화면으로 돌아갑니다</p>
          </div>
        )}

        {/* 없음 화면 */}
        {phase === 'notfound' && (
          <div className="w-full max-w-lg text-center my-auto">
            <p className="text-5xl mb-4">😔</p>
            <p className="text-white text-2xl font-bold mb-2">예약을 찾을 수 없습니다</p>
            <p className="text-gray-400 mb-2"><strong className="text-white">"{input}"</strong> 으로 예약된 내역이 없습니다</p>
            <p className="text-gray-500 text-sm mb-6">동호수를 다시 확인하거나 안내데스크에 문의하세요</p>
            {debugInfo && (
              <div className="text-left bg-gray-900 rounded-xl p-3 mb-6 text-xs text-gray-400 break-all">
                <p className="text-yellow-400 font-bold mb-1">🔍 진단 정보</p>
                <p>{debugInfo}</p>
              </div>
            )}
            <button onClick={reset}
              className="rounded-xl font-bold text-xl w-full transition-all active:scale-95"
              style={{ backgroundColor: '#667EEA', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}>
              다시 입력
            </button>
            <p className="text-gray-500 text-sm mt-4">{autoResetSecs}초 후 자동으로 처음 화면으로 돌아갑니다</p>
          </div>
        )}

        {/* 오류 화면 */}
        {phase === 'error' && (
          <div className="w-full max-w-lg text-center my-auto">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="text-white text-2xl font-bold mb-2">오류가 발생했습니다</p>
            <p className="text-gray-400 text-sm mb-6">잠시 후 다시 시도하세요</p>
            {debugInfo && (
              <div className="text-left bg-gray-900 rounded-xl p-3 mb-6 text-xs text-red-400 break-all">
                <p className="text-red-400 font-bold mb-1">❌ 오류 정보</p>
                <p>{debugInfo}</p>
              </div>
            )}
            <button onClick={reset}
              className="rounded-xl font-bold text-xl w-full transition-all active:scale-95"
              style={{ backgroundColor: '#667EEA', color: 'white', height: 72, border: 'none', cursor: 'pointer' }}>
              다시 시도
            </button>
          </div>
        )}
      </div>

      {/* ── 재출력 팝업 ────────────────────────────────────────────── */}
      {showReprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: '#1e1e3a' }}>

            {/* 팝업 헤더 */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#667EEA' }}>
              <div>
                <p className="text-white text-xs opacity-75 tracking-widest">재출력</p>
                <p className="text-white font-bold">동호수 입력</p>
              </div>
              <button
                onClick={closeReprint}
                className="text-white opacity-75 hover:opacity-100 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {reprintPhase === 'input' && (
                <>
                  <p className="text-gray-400 text-sm text-center mb-4">재출력할 동호수를 입력하세요</p>
                  <ReprintNumpad value={reprintInput} onChange={setReprintInput} />
                  <button
                    onClick={handleReprintSearch}
                    disabled={!reprintInput.trim() || reprintSearching}
                    className="w-full rounded-xl font-bold text-lg transition-all active:scale-95 mt-3"
                    style={{
                      backgroundColor: reprintInput.trim() && !reprintSearching ? '#48bb78' : '#2a3a2a',
                      color: 'white', height: 64, border: 'none',
                      cursor: reprintInput.trim() && !reprintSearching ? 'pointer' : 'not-allowed',
                      opacity: reprintInput.trim() && !reprintSearching ? 1 : 0.5,
                    }}
                  >
                    {reprintSearching ? '조회 중...' : '조회'}
                  </button>
                </>
              )}

              {reprintPhase === 'result' && (
                <>
                  <p className="text-green-400 text-center font-bold mb-3">✓ {reprintFound.length}건 확인됨</p>
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {reprintFound.map(r => (
                      <div key={r.id} className="bg-white rounded-xl p-3 text-left">
                        <p className="font-bold text-gray-800 text-sm">{formatDate(r.date)}{r.time && r.time !== '시간 미지정' ? ` ${r.time}` : ''}</p>
                        <p className="text-xs text-gray-500">{r.customer.name || r.extraFields['name'] || ''}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setReprintPhase('input')}
                      className="rounded-xl font-bold transition-all active:scale-95"
                      style={{ backgroundColor: '#3a3a5a', color: 'white', height: 56, border: 'none', cursor: 'pointer' }}>
                      다시 입력
                    </button>
                    <button
                      onClick={() => doPrint(reprintFound, false)}
                      disabled={printing}
                      className="rounded-xl font-bold transition-all active:scale-95"
                      style={{ backgroundColor: printing ? '#4a5a8a' : '#667EEA', color: 'white', height: 56, border: 'none', cursor: printing ? 'not-allowed' : 'pointer' }}>
                      {printing ? '출력 중...' : '🖨️ 재출력'}
                    </button>
                  </div>
                </>
              )}

              {reprintPhase === 'notfound' && (
                <>
                  <p className="text-red-400 text-center font-bold mb-2">발급 내역 없음</p>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    <strong className="text-white">"{reprintInput}"</strong> 의 기발급 내역이 없습니다
                  </p>
                  <button
                    onClick={() => { setReprintPhase('input'); setReprintInput(''); }}
                    className="w-full rounded-xl font-bold transition-all active:scale-95"
                    style={{ backgroundColor: '#667EEA', color: 'white', height: 56, border: 'none', cursor: 'pointer' }}>
                    다시 입력
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
