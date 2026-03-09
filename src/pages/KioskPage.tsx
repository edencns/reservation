import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiGetReservations } from '../utils/cloudApi';
import { getReservations } from '../utils/storage';
import { formatDate, normalizeUnitNumber } from '../utils/helpers';
import type { Event, Reservation } from '../types';

type Phase = 'input' | 'result' | 'notfound' | 'error';

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '동', '0', '호'];

// 로고 URL 또는 base64 데이터 URL — 비워두면 로고 없이 출력
const TICKET_LOGO_URL = '/logo.png';

// 예약 ID → 고정 6자리 응모번호 (재출력해도 동일)
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
          ${r.checkedIn ? '<div class="checked">✓ 이미 입장완료</div>' : ''}
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
    .checked { font-size: 11pt; font-weight: 700; margin-top: 2mm; }
    .sep { font-size: 8pt; color: #000; letter-spacing: -1px; overflow: hidden; line-height: 1; padding: 2mm 0; }
    .rows { padding: 1mm 0; }
    .row { display: flex; align-items: flex-start; padding: 2mm 0; }
    .lbl { font-size: 11pt; min-width: 18mm; flex-shrink: 0; color: #333; }
    .val { font-size: 12pt; font-weight: 700; flex: 1; word-break: keep-all; line-height: 1.4; }
    .small { font-size: 8pt; color: #555; padding: 2mm 0; word-break: break-all; }
    .logo-wrap { padding: 3mm 0 2mm; }
    .logo { max-width: 40mm; max-height: 20mm; object-fit: contain; }
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

export default function KioskPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getEventBySlug, getEventById } = useApp();
  const event = getEventBySlug(slug ?? '') ?? getEventById(slug ?? '');

  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [found, setFound] = useState<Reservation[]>([]);
  const [autoResetSecs, setAutoResetSecs] = useState(0);
  const [searching, setSearching] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== 'result' && phase !== 'notfound') return;
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

  const handleSearch = async () => {
    if (!input.trim() || !event || searching) return;
    setSearching(true);
    try {
      // API + localStorage 둘 다 가져와서 합침 (어느 쪽에만 있어도 찾을 수 있게)
      let fromApi: Reservation[] = [];
      let apiError = '';
      try { fromApi = await apiGetReservations(); } catch (e) { apiError = String(e); }
      const fromLocal = getReservations();
      const apiIds = new Set(fromApi.map(r => r.id));
      const fresh = [...fromApi, ...fromLocal.filter(r => !apiIds.has(r.id))];

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

      const results = fresh.filter(r => isThisEvent(r) && r.status !== 'cancelled' && matchesUnit(r));

      const eventReservations = fresh.filter(isThisEvent);
      setDebugInfo(
        `전체: ${fresh.length}건 (API:${fromApi.length} 로컬:${fromLocal.length}) | 이 행사: ${eventReservations.length}건 | 입력: "${input.trim()}"` +
        (apiError ? ` | API오류: ${apiError}` : '') +
        (eventReservations.length > 0 ? ` | 샘플: ${JSON.stringify(eventReservations[0].extraFields)}` : '')
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

  const handlePrint = async () => {
    if (!event || printing) return;
    setPrinting(true);
    try {
      const logoUrl = TICKET_LOGO_URL ? window.location.origin + TICKET_LOGO_URL : '';
      const html = buildTicketHtml(found, event, logoUrl);
      const popup = window.open('', '_blank', 'width=340,height=600,menubar=no,toolbar=no,location=no,status=no');
      if (!popup) {
        // 팝업 차단된 경우 fallback
        window.print();
      } else {
        popup.document.write(html);
        popup.document.close();
      }
      setTimeout(reset, 1000);
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
        <div>
          <p className="text-white text-xs opacity-75 uppercase tracking-widest">입장권 발급 키오스크</p>
          <p className="text-white font-bold text-lg leading-tight">{event.title}</p>
        </div>
        {(phase === 'result' || phase === 'notfound') && (
          <p className="text-white text-sm opacity-75">{autoResetSecs}초 후 자동 초기화</p>
        )}
      </div>

      {/* 메인 */}
      <div className="flex-1 flex items-center justify-center p-8">

        {/* 입력 화면 */}
        {phase === 'input' && (
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <p className="text-white text-2xl font-bold mb-2">{unitLabel} 입력</p>
              <p className="text-gray-400 text-sm">예약 시 입력한 {unitLabel}을 입력하세요</p>
            </div>

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
        )}

        {/* 결과 화면 */}
        {phase === 'result' && (
          <div className="w-full max-w-lg text-center">
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
              <button onClick={handlePrint} disabled={printing}
                className="rounded-xl font-bold text-lg transition-all active:scale-95"
                style={{ backgroundColor: printing ? '#4a5a8a' : '#667EEA', color: 'white', height: 72, border: 'none', cursor: printing ? 'not-allowed' : 'pointer' }}>
                {printing ? '출력 준비 중...' : '🖨️ 입장권 출력'}
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-4">{autoResetSecs}초 후 자동으로 처음 화면으로 돌아갑니다</p>
          </div>
        )}

        {/* 없음 화면 */}
        {phase === 'notfound' && (
          <div className="w-full max-w-lg text-center">
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
          <div className="w-full max-w-lg text-center">
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
    </div>
  );
}
