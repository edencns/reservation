import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, MessageSquare, Send, Trash2, Download } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { apiSendSms, type SmsSendResult } from '../../utils/cloudApi';
import { exportToExcel } from '../../utils/exportExcel';
import type { Reservation } from '../../types';

export default function ReservationsManage() {
  const { events, reservations, cancelReservation, deleteReservation } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState(searchParams.get('eventId') ?? 'all');
  const [detailR, setDetailR] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const deleteInputRef = useRef<HTMLInputElement>(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsTemplate, setSmsTemplate] = useState<'confirm' | 'reminder'>('confirm');
  const [smsDays, setSmsDays] = useState(7);
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<SmsSendResult | null>(null);
  const [smsError, setSmsError] = useState('');

  useEffect(() => {
    const next = searchParams.get('eventId') ?? 'all';
    setEventFilter(next);
  }, [searchParams]);

  const eventOptions = useMemo(() => (
    events.map(e => ({ id: e.id, title: e.title }))
  ), [events]);

  const filtered = reservations.filter(r => {
    const matchSearch =
      r.eventTitle.includes(search) ||
      r.customer.name.includes(search) ||
      r.customer.phone.includes(search) ||
      r.id.includes(search);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchEvent = eventFilter === 'all' || r.eventId === eventFilter;
    return matchSearch && matchStatus && matchEvent;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const updateEventFilter = (next: string) => {
    setEventFilter(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') {
      params.delete('eventId');
    } else {
      params.set('eventId', next);
    }
    setSearchParams(params);
  };

  const handleCancel = (id: string) => {
    setCancelTarget(id);
  };

  const confirmCancel = () => {
    if (cancelTarget) {
      cancelReservation(cancelTarget);
    }
    setCancelTarget(null);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
    setDeletePassword('');
    setDeleteError('');
    setTimeout(() => deleteInputRef.current?.focus(), 100);
  };

  const confirmDelete = () => {
    if (deletePassword !== '123') {
      setDeleteError('비밀번호가 올바르지 않습니다.');
      return;
    }
    if (deleteTarget) {
      deleteReservation(deleteTarget);
      setDetailR(null);
    }
    setDeleteTarget(null);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleExport = () => {
    const event = eventFilter !== 'all' ? events.find(e => e.id === eventFilter) : null;
    const customFields = event?.customFields ?? [];
    const data = filtered.map(r => {
      const row: Record<string, string | number> = {
        '예약번호': r.id.slice(0, 8).toUpperCase(),
        '행사명': r.eventTitle,
        '예약자명': r.customer.name,
        '연락처': r.customer.phone,
        '이메일': r.customer.email || '',
        '방문날짜': formatDate(r.date),
        '시간': r.time,
        '방문인원': r.attendeeCount,
        '상태': r.status === 'confirmed' ? '확정' : '취소',
        '입장여부': r.checkedIn ? '입장완료' : '미입장',
        '입장시각': r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('ko-KR') : '',
        '예약일시': new Date(r.createdAt).toLocaleString('ko-KR'),
      };
      for (const f of customFields) {
        if (r.extraFields[f.key]) row[f.label] = r.extraFields[f.key];
      }
      return row;
    });
    exportToExcel('예약관리', [{ name: '예약 목록', data }]);
  };

  // SMS 발송 대상: 현재 필터 기준 확정 예약
  const smsTargets = filtered.filter(r => r.status === 'confirmed');

  const handleSmsSend = async () => {
    if (smsTargets.length === 0) return;
    setSmsSending(true);
    setSmsResult(null);
    setSmsError('');
    try {
      const result = await apiSendSms(
        smsTargets.map(r => r.id),
        smsTemplate,
        smsTemplate === 'reminder' ? smsDays : undefined,
      );
      setSmsResult(result);
    } catch (e) {
      setSmsError(e instanceof Error ? e.message : '발송 중 오류가 발생했습니다.');
    } finally {
      setSmsSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">예약 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 border border-gray-200 text-gray-600"
          >
            <Download size={15} /> 엑셀
          </button>
          <button
            onClick={() => { setShowSmsModal(true); setSmsResult(null); setSmsError(''); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
            style={{ backgroundColor: '#667EEA' }}
          >
            <MessageSquare size={15} /> 문자 발송
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="행사명, 예약자명, 연락처, 예약번호 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
          />
        </div>
        <select
          value={eventFilter}
          onChange={e => updateEventFilter(e.target.value)}
          className="min-w-[180px] px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white"
        >
          <option value="all">모든 행사</option>
          {eventOptions.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {[
            { value: 'all', label: '전체' },
            { value: 'confirmed', label: '확정' },
            { value: 'cancelled', label: '취소' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === f.value ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={statusFilter === f.value ? { backgroundColor: '#667EEA' } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">총 {filtered.length}건</p>

      {/* Desktop table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#E0D6F9' }}>
                {['예약번호', '행사명', '예약자', '방문날짜', '상태', '입장', ''].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">예약 내역이 없습니다</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}
                  onClick={() => setDetailR(r)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${r.checkedIn ? 'bg-green-50 hover:bg-green-100' : ''}`}>
                  <td className="px-3 py-3 font-mono text-xs text-gray-400">{r.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-3 py-3 max-w-[160px]">
                    <p className="font-medium text-gray-800 truncate">{r.eventTitle}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-gray-700">{r.customer.name}</p>
                    <p className="text-xs text-gray-400">{r.customer.phone}</p>
                  </td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.status === 'confirmed' ? '확정' : '취소'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {r.checkedIn ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">입장완료</span>
                    ) : r.status === 'confirmed' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">미입장</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-300">상세 →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">예약 내역이 없습니다</p>
          ) : filtered.map(r => (
            <div key={r.id} className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${r.checkedIn ? 'bg-green-50' : ''}`}
              onClick={() => setDetailR(r)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-800">{r.eventTitle}</p>
                  <p className="text-xs text-gray-500">{r.customer.name} · {r.customer.phone}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  r.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {r.status === 'confirmed' ? '확정' : '취소'}
                </span>
              </div>
              <p className="text-xs text-gray-500">{formatDate(r.date)}</p>
              {r.checkedIn && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">입장완료</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 예약 상세 모달 */}
      {detailR && (() => {
        const event = events.find(e => e.id === detailR.eventId);
        const fieldLabelMap: Record<string, string> = {
          name: '이름', phone: '연락처', email: '이메일', unitNumber: '동호수', interestedServices: '관심 서비스',
          ...(event?.customFields ?? []).reduce((acc, f) => ({ ...acc, [f.key]: f.label }), {} as Record<string, string>),
        };
        const baseKeys = new Set(['name', 'phone', 'email']);
        const extraEntries = Object.entries(detailR.extraFields ?? {}).filter(([k]) => !baseKeys.has(k));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDetailR(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
                <h3 className="font-bold text-gray-800">예약 상세</h3>
                <button onClick={() => setDetailR(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              {/* Body */}
              <div className="overflow-y-auto px-5 py-4 space-y-4">
                {/* 예약 메타 */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">예약번호</span>
                    <span className="font-mono text-xs text-gray-600">{detailR.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">행사명</span>
                    <span className="font-medium text-gray-800 text-right max-w-[180px] truncate">{detailR.eventTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">방문날짜</span>
                    <span className="text-gray-700">{formatDate(detailR.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">상태</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      detailR.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {detailR.status === 'confirmed' ? '확정' : '취소'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">입장</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      detailR.checkedIn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {detailR.checkedIn ? '입장완료' : '미입장'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">예약일시</span>
                    <span className="text-xs text-gray-500">{new Date(detailR.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
                {/* 예약자 정보 */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">예약자 정보</p>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: '이름', value: detailR.customer.name },
                      { label: '연락처', value: detailR.customer.phone },
                      { label: '이메일', value: detailR.customer.email || '-' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-400">{row.label}</span>
                        <span className="text-gray-800 font-medium">{row.value}</span>
                      </div>
                    ))}
                    {extraEntries.map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-400 shrink-0">{fieldLabelMap[key] ?? key}</span>
                        <span className="text-gray-800 font-medium text-right max-w-[200px]">{val || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Footer buttons */}
              <div className="px-5 pb-5 pt-3 flex gap-2 shrink-0 border-t border-gray-100">
                {detailR.status === 'confirmed' && (
                  <button
                    onClick={() => { setDetailR(null); handleCancel(detailR.id); }}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100"
                  >
                    예약 취소
                  </button>
                )}
                <button
                  onClick={() => { setDetailR(null); handleDelete(detailR.id); }}
                  className="py-2.5 px-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold hover:bg-gray-200"
                  title="예약 삭제"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 취소 확인 모달 */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setCancelTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 text-lg mb-2">예약 취소</h3>
            <p className="text-sm text-gray-500 mb-6">이 예약을 취소하시겠습니까?<br />취소 내역은 목록에 남습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                아니오
              </button>
              <button onClick={confirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                취소하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 비밀번호 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 text-lg mb-1">예약 삭제</h3>
            <p className="text-sm text-gray-500 mb-4">삭제하면 복구할 수 없습니다.<br />비밀번호를 입력하세요.</p>
            <input
              ref={deleteInputRef}
              type="password"
              value={deletePassword}
              onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
              onKeyDown={e => e.key === 'Enter' && confirmDelete()}
              placeholder="비밀번호"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-2"
            />
            {deleteError && <p className="text-xs text-red-500 mb-3">{deleteError}</p>}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                취소
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 flex items-center justify-center gap-1.5">
                <Trash2 size={14} /> 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS 발송 모달 */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => { if (!smsSending) setShowSmsModal(false); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <MessageSquare size={18} style={{ color: '#667EEA' }} /> 문자 일괄 발송
              </h3>
              {!smsSending && (
                <button onClick={() => setShowSmsModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-400" />
                </button>
              )}
            </div>

            {/* 발송 대상 */}
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">발송 대상</p>
              <p className="text-sm text-gray-800">
                현재 필터 기준 확정 예약 <span className="font-bold" style={{ color: '#667EEA' }}>{smsTargets.length}건</span>
              </p>
              {eventFilter !== 'all' && (
                <p className="text-xs text-gray-400 mt-0.5">
                  행사: {events.find(e => e.id === eventFilter)?.title ?? ''}
                </p>
              )}
              {smsTargets.length === 0 && (
                <p className="text-xs text-red-500 mt-1">발송 대상이 없습니다. 필터를 조정해주세요.</p>
              )}
            </div>

            {/* 문자 유형 */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">문자 유형</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'confirm' as const, label: '예약 확인 문자', desc: '예약 완료 안내 + QR 링크' },
                  { value: 'reminder' as const, label: '리마인더 문자', desc: '행사 N일 전 방문 안내' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSmsTemplate(opt.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      smsTemplate === opt.value ? 'border-[#667EEA] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-800">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 리마인더 일수 */}
            {smsTemplate === 'reminder' && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">발송 기준</p>
                <div className="flex gap-2">
                  {[{ label: '1일 전', days: 1 }, { label: '3일 전', days: 3 }, { label: '1주일 전', days: 7 }].map(d => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setSmsDays(d.days)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        smsDays === d.days ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      style={smsDays === d.days ? { backgroundColor: '#667EEA' } : {}}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 결과 표시 */}
            {smsResult && (
              <div className="bg-green-50 rounded-xl p-3 text-sm">
                <p className="font-bold text-green-700">발송 완료</p>
                <p className="text-green-600">성공: {smsResult.sent}건 / 실패: {smsResult.failed}건 / 전체: {smsResult.total}건</p>
              </div>
            )}
            {smsError && (
              <div className="bg-red-50 rounded-xl p-3 text-sm">
                <p className="font-bold text-red-600">오류 발생</p>
                <p className="text-red-500">{smsError}</p>
                <p className="text-xs text-gray-400 mt-1">Cloudflare 환경변수(COOLSMS_API_KEY, COOLSMS_API_SECRET, COOLSMS_SENDER, SITE_URL)를 확인하세요.</p>
              </div>
            )}

            {/* 버튼 */}
            {!smsResult && (
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowSmsModal(false)}
                  disabled={smsSending}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSmsSend}
                  disabled={smsSending || smsTargets.length === 0}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#667EEA' }}
                >
                  {smsSending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 발송 중...</>
                  ) : (
                    <><Send size={15} /> {smsTargets.length}건 발송</>
                  )}
                </button>
              </div>
            )}
            {smsResult && (
              <button
                onClick={() => setShowSmsModal(false)}
                className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90"
                style={{ backgroundColor: '#667EEA' }}
              >
                확인
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
