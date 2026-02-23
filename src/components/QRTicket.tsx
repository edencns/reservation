import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { Reservation, CustomField } from '../types';
import { formatDate, formatDateTime } from '../utils/helpers';

interface Props {
  reservation: Reservation;
  extraFields?: CustomField[];  // 커스텀 필드 정의 (레이블 표시용)
  compact?: boolean;
}

export default function QRTicket({ reservation: r, extraFields = [], compact = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, r.id, {
        width: compact ? 80 : 160,
        margin: 2,
        color: { dark: '#2c3e50', light: '#ffffff' },
      });
    }
  }, [r.id, compact]);

  // 커스텀 필드 값 목록 (레이블 + 값)
  const definedKeys = new Set(extraFields.map(f => f.key));
  const customRows = extraFields
    .filter(f => r.extraFields[f.key])
    .map(f => ({ label: f.label, value: r.extraFields[f.key] }));
  if (!definedKeys.has('unitNumber') && r.extraFields['unitNumber']) {
    customRows.push({ label: '동호수', value: r.extraFields['unitNumber'] });
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-3 flex items-center gap-3">
        <canvas ref={canvasRef} className="rounded shrink-0" />
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{r.eventTitle}</p>
          <p className="text-xs text-gray-500">{formatDate(r.date)} {r.time}</p>
          <p className="text-xs text-gray-500">{r.venue}</p>
          <p className="text-xs font-semibold mt-1" style={{ color: '#91ADC2' }}>
            {r.customer.name || r.extraFields['name'] || ''} · {r.attendeeCount}명
          </p>
          <div className="flex gap-1 mt-1">
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              r.status === 'confirmed' ? 'text-white' : 'bg-gray-100 text-gray-500'
            }`} style={r.status === 'confirmed' ? { backgroundColor: '#91ADC2' } : {}}>
              {r.status === 'confirmed' ? '예약확정' : '취소됨'}
            </span>
            {r.checkedIn && (
              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">입장완료</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayName = r.customer.name || r.extraFields['name'] || '';
  const displayPhone = r.customer.phone || r.extraFields['phone'] || '';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm mx-auto">
      {/* 헤더 */}
      <div className="text-white text-center py-4 px-5" style={{ backgroundColor: '#91ADC2' }}>
        <p className="text-xs uppercase tracking-widest opacity-75 mb-1">ReserveTicket</p>
        <h2 className="font-bold text-base leading-tight">{r.eventTitle}</h2>
        {r.checkedIn && (
          <span className="inline-block mt-2 text-xs bg-green-500 text-white px-3 py-0.5 rounded-full font-semibold">
            ✓ 입장완료 {r.checkedInAt ? `(${formatDateTime(r.checkedInAt)})` : ''}
          </span>
        )}
      </div>

      {/* QR */}
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

        {/* 기본 정보 */}
        <div className="space-y-2 text-sm">
          {[
            { label: '장소', value: r.venue },
            { label: '날짜', value: formatDate(r.date) },
            { label: '시간', value: r.time },
            { label: '방문 인원', value: `${r.attendeeCount}명` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-2">
              <span className="text-gray-400 shrink-0 w-16 text-xs">{label}</span>
              <span className="font-medium text-gray-700 text-right flex-1 text-sm">{value}</span>
            </div>
          ))}

          {/* 커스텀 필드 값 */}
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

      {/* 구분선 */}
      <div className="px-4 my-1">
        <div className="border-t-2 border-dashed border-gray-200" />
      </div>

      {/* 푸터 */}
      <div style={{ backgroundColor: '#FFDAB9' }} className="px-5 py-3 text-center">
        <p className="text-xs text-gray-600 font-medium">
          방문 시 이 QR코드를 제시해 주세요
        </p>
      </div>
    </div>
  );
}
