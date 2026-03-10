import { useState, useRef } from 'react';
import { CheckCircle, XCircle, QrCode, Users, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { exportToExcel } from '../../utils/exportExcel';

export default function CheckIn() {
  const { events, reservations, checkIn } = useApp();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<typeof reservations[0] | null | 'not-found'>(null);
  const lookupRef = useRef<HTMLInputElement>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // 선택된 날짜+행사 예약 목록
  const dayReservations = reservations.filter(r =>
    r.eventId === selectedEventId &&
    r.date === selectedDate &&
    r.status === 'confirmed'
  ).sort((a, b) => a.time.localeCompare(b.time));

  // 검색 필터
  const filtered = dayReservations.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (r.customer.name || r.extraFields['name'] || '').includes(s) ||
      (r.customer.phone || r.extraFields['phone'] || '').includes(s) ||
      r.id.toLowerCase().includes(s)
    );
  });

  // 시간대별 그룹
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach(r => {
    if (!grouped[r.time]) grouped[r.time] = [];
    grouped[r.time].push(r);
  });

  // 체크인 통계
  const checkedInCount = dayReservations.filter(r => r.checkedIn).length;
  const checkedInVisitors = dayReservations.filter(r => r.checkedIn).reduce((s, r) => s + r.attendeeCount, 0);

  // ID 직접 조회
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const id = lookupId.trim().toLowerCase();
    const found = reservations.find(r => r.id.toLowerCase() === id || r.id.toLowerCase().startsWith(id));
    setLookupResult(found ?? 'not-found');
  };

  const handleCheckIn = (id: string) => {
    checkIn(id);
    if (lookupResult && lookupResult !== 'not-found' && lookupResult.id === id) {
      setLookupResult({ ...lookupResult, checkedIn: true, checkedInAt: new Date().toISOString() });
    }
    setLookupId('');
    setTimeout(() => lookupRef.current?.focus(), 100);
  };

  const getName = (r: typeof reservations[0]) => r.customer.name || r.extraFields['name'] || '(이름 없음)';
  const getPhone = (r: typeof reservations[0]) => r.customer.phone || r.extraFields['phone'] || '';

  const handleExport = () => {
    const customFields = selectedEvent?.customFields ?? [];
    const data = dayReservations.map(r => {
      const row: Record<string, string | number> = {
        '시간': r.time,
        '예약자명': getName(r),
        '연락처': getPhone(r),
        '방문인원': r.attendeeCount,
        '상태': r.checkedIn ? '입장완료' : '미입장',
        '입장시각': r.checkedInAt ? formatDateTime(r.checkedInAt) : '',
        '예약번호': r.id.slice(0, 8).toUpperCase(),
      };
      for (const f of customFields) {
        if (r.extraFields[f.key]) row[f.label] = r.extraFields[f.key];
      }
      return row;
    });
    const eventTitle = selectedEvent?.title ?? '방문현황';
    exportToExcel(`방문현황_${eventTitle}_${selectedDate}`, [{ name: '방문 현황', data }]);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">QR 체크인</h2>
        {selectedEventId && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <Download size={15} /> 엑셀
          </button>
        )}
      </div>

      {/* 행사·날짜 선택 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">행사 선택</label>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
          >
            <option value="">행사를 선택하세요</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">날짜</label>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
          >
            {(selectedEvent?.dates ?? []).map(d => (
              <option key={d} value={d}>{formatDate(d)}</option>
            ))}
            {!selectedEvent && (
              <option value={selectedDate}>{formatDate(selectedDate)}</option>
            )}
          </select>
        </div>
      </div>

      {selectedEventId && (
        <>
          {/* 통계 요약 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '총 예약', value: dayReservations.length + '건', color: '#667EEA' },
              { label: '입장 완료', value: checkedInCount + '건', color: '#22c55e' },
              { label: '방문 인원', value: `${checkedInVisitors}명`, color: '#f97316' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <p className="font-extrabold text-xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ID 직접 조회 (QR 입력) */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <QrCode size={16} style={{ color: '#667EEA' }} />
              QR 코드 / 예약번호 조회
            </h3>
            <form onSubmit={handleLookup} className="flex gap-2">
              <input
                ref={lookupRef}
                type="text"
                placeholder="예약 번호를 입력하거나 QR 리더로 스캔하세요"
                value={lookupId}
                onChange={e => setLookupId(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                autoFocus
              />
              <button type="submit"
                className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
                style={{ backgroundColor: '#667EEA' }}>
                조회
              </button>
            </form>

            {/* 조회 결과 */}
            {lookupResult && (
              <div className={`mt-3 p-4 rounded-xl border-2 ${
                lookupResult === 'not-found' ? 'border-red-200 bg-red-50' :
                lookupResult.checkedIn ? 'border-green-200 bg-green-50' :
                lookupResult.status === 'cancelled' ? 'border-gray-200 bg-gray-50' :
                'border-[#667EEA] bg-[#667EEA11]'
              }`}>
                {lookupResult === 'not-found' ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle size={20} />
                    <p className="font-bold text-sm">예약을 찾을 수 없습니다</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {lookupResult.checkedIn ? (
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle size={11} /> 입장완료 {lookupResult.checkedInAt ? `(${formatDateTime(lookupResult.checkedInAt)})` : ''}
                            </span>
                          ) : lookupResult.status === 'cancelled' ? (
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">취소된 예약</span>
                          ) : (
                            <span className="text-xs text-white font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#667EEA' }}>예약확정</span>
                          )}
                        </div>
                        <p className="font-bold text-gray-800">{lookupResult.eventTitle}</p>
                        <p className="text-sm text-gray-600">{formatDate(lookupResult.date)}{lookupResult.time && lookupResult.time !== '시간 미지정' ? ` · ${lookupResult.time}` : ''}</p>
                        <p className="text-sm font-semibold mt-1" style={{ color: '#667EEA' }}>
                          {getName(lookupResult)} · {getPhone(lookupResult)}
                        </p>
                        <p className="text-xs text-gray-500">{lookupResult.attendeeCount}명 방문</p>
                      </div>
                      {!lookupResult.checkedIn && lookupResult.status === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(lookupResult.id)}
                          className="shrink-0 px-4 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90"
                          style={{ backgroundColor: '#22c55e' }}
                        >
                          입장 처리
                        </button>
                      )}
                    </div>
                    {/* 커스텀 필드 값 표시 */}
                    {Object.keys(lookupResult.extraFields).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-2 gap-1">
                        {Object.entries(lookupResult.extraFields)
                          .filter(([k]) => !['name', 'phone', 'email'].includes(k))
                          .map(([key, val]) => {
                            const field = selectedEvent?.customFields.find(f => f.key === key);
                            return (
                              <div key={key} className="text-xs text-gray-600">
                                <span className="text-gray-400">{field?.label ?? key}: </span>
                                <span className="font-medium">{val}</span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 예약 목록 */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <Users size={15} style={{ color: '#667EEA' }} />
                시간대별 예약 목록
              </h3>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="이름·연락처·번호 검색"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                />
              </div>
            </div>

            {dayReservations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">해당 날짜 예약이 없습니다</p>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([time, list]) => {
                  const slotChecked = list.filter(r => r.checkedIn).length;
                  const slotCheckedVisitors = list.filter(r => r.checkedIn).reduce((s, r) => s + r.attendeeCount, 0);
                  return (
                    <div key={time}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-sm" style={{ color: '#667EEA' }}>{time}</span>
                        <span className="text-xs text-gray-400">
                          예약 {list.length}건 · 방문 {slotChecked}건 ({slotCheckedVisitors}명)
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <div className="space-y-2">
                        {list.map(r => (
                          <div
                            key={r.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${
                              r.checkedIn ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-800">{getName(r)}</p>
                                <span className="text-xs text-gray-400">{r.attendeeCount}명</span>
                              </div>
                              <p className="text-xs text-gray-500">{getPhone(r)}</p>
                              {Object.entries(r.extraFields)
                                .filter(([k]) => !['name', 'phone', 'email'].includes(k))
                                .slice(0, 2)
                                .map(([key, val]) => {
                                  const field = selectedEvent?.customFields.find(f => f.key === key);
                                  return (
                                    <span key={key} className="text-xs text-gray-400 mr-2">
                                      {field?.label ?? key}: {val}
                                    </span>
                                  );
                                })}
                            </div>
                            {r.checkedIn ? (
                              <span className="shrink-0 flex items-center gap-1 text-xs text-green-600 font-semibold">
                                <CheckCircle size={15} /> 입장완료
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCheckIn(r.id)}
                                className="shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:opacity-90"
                                style={{ backgroundColor: '#667EEA' }}
                              >
                                입장
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedEventId && (
        <div className="text-center py-16 text-gray-400">
          <QrCode size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">행사를 선택하면 체크인 관리를 시작할 수 있습니다</p>
        </div>
      )}
    </div>
  );
}
