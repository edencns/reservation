import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { apiGetReservations } from '../utils/cloudApi';
import { getReservations } from '../utils/storage';
import { formatDate, normalizeUnitNumber } from '../utils/helpers';
import type { Event, Reservation } from '../types';

type Phase = 'input' | 'result' | 'notfound' | 'error';

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '동', '0', '호'];

function matchUnitNumber(stored: string, query: string): boolean {
  const s = stored.replace(/\s/g, '').toLowerCase();
  const q = query.replace(/\s/g, '').toLowerCase();
  if (!s || !q) return false;
  const sNorm = normalizeUnitNumber(stored);
  const qNorm = normalizeUnitNumber(query);
  if (sNorm && qNorm && sNorm === qNorm) return true;
  return s === q || s.includes(q) || q.includes(s);
}

async function buildTicketHtml(reservations: Reservation[], event: Event): Promise<string> {
  const rows = await Promise.all(
    reservations.map(async (r) => {
      const qrDataUrl = await QRCode.toDataURL(r.id, {
        width: 200,
        margin: 2,
        color: { dark: '#2c3e50', light: '#ffffff' },
      });

      const customRows = event.customFields
        .filter(f => r.extraFields[f.key])
        .map(f => `
          <tr>
            <td style="color:#888;font-size:12px;padding:4px 8px 4px 0;white-space:nowrap">${f.label}</td>
            <td style="font-size:13px;font-weight:600;color:#2c3e50;padding:4px 0">${r.extraFields[f.key]}</td>
          </tr>`)
        .join('');

      const name = r.customer.name || r.extraFields['name'] || '';
      const phone = r.customer.phone || r.extraFields['phone'] || '';
      const checkedInBadge = r.checkedIn
        ? `<div style="display:inline-block;background:#22c55e;color:white;font-size:11px;padding:2px 10px;border-radius:20px;margin-top:4px">✓ 이미 입장완료</div>`
        : '';

      return `
        <div style="width:320px;margin:0 auto 24px;font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;page-break-after:always">
          <!-- 헤더 -->
          <div style="background:#667EEA;color:white;text-align:center;padding:18px 20px 14px">
            <div style="font-size:10px;letter-spacing:3px;opacity:0.75;text-transform:uppercase;margin-bottom:4px">입장권</div>
            <div style="font-size:17px;font-weight:700;line-height:1.3">${r.eventTitle}</div>
            ${checkedInBadge}
          </div>

          <!-- QR 코드 -->
          <div style="text-align:center;padding:20px 20px 10px">
            <div style="display:inline-block;border:2px dashed #e5e7eb;border-radius:12px;padding:10px">
              <img src="${qrDataUrl}" width="160" height="160" style="display:block;border-radius:6px" />
            </div>
          </div>

          <!-- 예약번호 -->
          <div style="text-align:center;padding:0 20px 14px">
            <div style="font-size:10px;color:#aaa;margin-bottom:2px">예약 번호</div>
            <div style="font-family:monospace;font-size:10px;font-weight:700;color:#555;word-break:break-all">${r.id.toUpperCase()}</div>
          </div>

          <!-- 구분선 -->
          <div style="border-top:2px dashed #e5e7eb;margin:0 16px"></div>

          <!-- 예약 정보 -->
          <div style="padding:14px 20px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="color:#888;font-size:12px;padding:4px 8px 4px 0;white-space:nowrap">장소</td>
                <td style="font-size:13px;font-weight:600;color:#2c3e50;padding:4px 0">${r.venue}</td>
              </tr>
              <tr>
                <td style="color:#888;font-size:12px;padding:4px 8px 4px 0;white-space:nowrap">날짜</td>
                <td style="font-size:13px;font-weight:600;color:#2c3e50;padding:4px 0">${formatDate(r.date)}</td>
              </tr>
              ${r.time && r.time !== '시간 미지정' ? `
              <tr>
                <td style="color:#888;font-size:12px;padding:4px 8px 4px 0;white-space:nowrap">시간</td>
                <td style="font-size:13px;font-weight:600;color:#2c3e50;padding:4px 0">${r.time}</td>
              </tr>` : ''}
              ${customRows}
              ${name ? `
              <tr>
                <td style="color:#888;font-size:12px;padding:4px 8px 4px 0;white-space:nowrap">예약자</td>
                <td style="font-size:13px;font-weight:600;color:#2c3e50;padding:4px 0">${name}</td>
              </tr>` : ''}
              ${phone ? `
              <tr>
                <td style="color:#888;font-size:12px;padding:4px 8px 4px 0;white-space:nowrap">연락처</td>
                <td style="font-size:13px;font-weight:600;color:#2c3e50;padding:4px 0">${phone}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- 푸터 -->
          <div style="background:#E0D6F9;text-align:center;padding:10px 20px">
            <div style="font-size:11px;color:#555;font-weight:500">방문 시 이 QR코드를 제시해 주세요</div>
          </div>
        </div>`;
    })
  );

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8"/>
  <title>입장권</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; display: flex; flex-direction: column; align-items: center; padding: 20px; }
    @media print {
      body { padding: 0; }
      @page { margin: 8mm; size: A4; }
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
      let fresh: Reservation[];
      try {
        const fromApi = await apiGetReservations();
        fresh = fromApi.length > 0 ? fromApi : getReservations();
      } catch {
        fresh = getReservations();
      }

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
        `전체: ${fresh.length}건 | 이 행사: ${eventReservations.length}건 | 입력: "${input.trim()}"` +
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
      const html = await buildTicketHtml(found, event);
      const popup = window.open('', '_blank', 'width=500,height=700,menubar=no,toolbar=no,location=no,status=no');
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
