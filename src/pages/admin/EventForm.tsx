import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, Copy, GripVertical } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateId, generateSlug, getEventShareUrl } from '../../utils/helpers';
import type { Event, CustomField, CustomFieldType } from '../../types';

function generateDateRange(start: string, end: string): string[] {
  if (!start || !end) return [];
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

const DEFAULT_TIME_SLOT = [{ id: 'none', time: '시간 미지정' }];

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parse = (v: string) => {
    if (!v) return null;
    const [h, m] = v.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    let hour = h;
    if (hour === 0) hour = 12;
    else if (hour > 12) hour = 12;
    return { hour, minute: Math.min(59, Math.max(0, m)) };
  };

  const parsed = parse(value);
  const selCls = "border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA] bg-white cursor-pointer";

  const handleHour = (hStr: string) => {
    if (!hStr) { onChange(''); return; }
    const m = parsed?.minute ?? 0;
    onChange(`${hStr}:${String(m).padStart(2, '0')}`);
  };

  const handleMinute = (mStr: string) => {
    if (!mStr) { onChange(''); return; }
    const h = parsed?.hour ?? 9;
    onChange(`${h}:${mStr.padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center gap-1.5">
      <select value={parsed?.hour ?? ''} onChange={e => handleHour(e.target.value)} className={selCls}>
        <option value="" disabled hidden>시</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
          <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>
      <span className="text-gray-400 font-bold">:</span>
      <select value={parsed?.minute ?? ''} onChange={e => handleMinute(e.target.value)} className={selCls}>
        <option value="" disabled hidden>분</option>
        {Array.from({ length: 60 }, (_, i) => i).map(m => (
          <option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
  );
}

const BASE_FIELDS: CustomField[] = [
  { id: 'bf1', key: 'name', label: '이름', type: 'text', placeholder: '홍길동', required: true },
  { id: 'bf2', key: 'phone', label: '연락처', type: 'tel', placeholder: '01012345678', required: true },
  { id: 'bf3', key: 'email', label: '이메일', type: 'email', placeholder: 'example@email.com', required: true },
  { id: 'bf4', key: 'unitNumber', label: '동호수', type: 'text', placeholder: '예) 101동 501호', required: true },
];
const BASE_FIELD_KEYS = new Set(BASE_FIELDS.map(f => f.key));

const normalizeBaseFields = (fields: CustomField[]): CustomField[] => {
  const byKey = new Map(fields.map(f => [f.key, f]));
  const base = BASE_FIELDS.map(f => ({
    ...f,
    ...(byKey.get(f.key) ?? {}),
    required: true,
  }));
  const rest = fields.filter(f => !BASE_FIELD_KEYS.has(f.key));
  return [...base, ...rest];
};

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: '텍스트',
  tel: '전화번호',
  email: '이메일',
  number: '숫자',
  select: '선택지',
};

interface NewFieldState {
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder: string;
  options: string;
}

export default function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getEventById, addEvent, updateEvent } = useApp();
  const isEdit = id !== undefined && id !== 'create';
  const existing = isEdit ? getEventById(id) : undefined;
  const [eventId] = useState(existing?.id ?? generateId());

  const existingSlots = existing?.timeSlots ?? [];
  const initialStartTime = existing?.startTime
    ?? (existingSlots[0]?.time && existingSlots[0].time !== '시간 미지정'
      ? existingSlots[0].time
      : '');
  const initialEndTime = existing?.endTime
    ?? (existingSlots[existingSlots.length - 1]?.time
      && existingSlots[existingSlots.length - 1].time !== '시간 미지정'
      ? existingSlots[existingSlots.length - 1].time
      : '');

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [venue, setVenue] = useState(existing?.venue ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [startDate, setStartDate] = useState(existing?.dates[0] ?? '');
  const [endDate, setEndDate] = useState(existing?.dates[existing?.dates.length - 1] ?? '');
  const [status, setStatus] = useState<'active' | 'closed' | 'draft'>(existing?.status ?? 'active');
  const [slug] = useState<string>(existing?.slug ?? generateSlug());
  const [customFields, setCustomFields] = useState<CustomField[]>(
    normalizeBaseFields(existing?.customFields && existing.customFields.length > 0 ? existing.customFields : BASE_FIELDS)
  );
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<NewFieldState>({
    label: '', type: 'text', required: false, placeholder: '', options: '',
  });
  const [urlCopied, setUrlCopied] = useState(false);
  const shareUrl = getEventShareUrl(slug);

  const addCustomField = () => {
    if (!newField.label.trim()) return;
    const key = newField.label.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_가-힣]/g, '')
      || `field_${generateId().slice(0, 4)}`;
    const field: CustomField = {
      id: generateId(),
      key,
      label: newField.label.trim(),
      type: newField.type,
      required: newField.required,
      placeholder: newField.placeholder.trim() || undefined,
      options: newField.type === 'select'
        ? newField.options.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
    };
    setCustomFields(prev => [...prev, field]);
    setNewField({ label: '', type: 'text', required: false, placeholder: '', options: '' });
    setShowAddField(false);
  };

  const removeField = (fid: string) => setCustomFields(prev =>
    prev.filter(f => f.id !== fid || BASE_FIELD_KEYS.has(f.key))
  );
  const toggleRequired = (fid: string) =>
    setCustomFields(prev => prev.map(f => {
      if (f.id !== fid || BASE_FIELD_KEYS.has(f.key)) return f;
      return { ...f, required: !f.required };
    }));

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dates = generateDateRange(startDate, endDate);
    if (dates.length === 0) { alert('날짜 범위를 확인해주세요.'); return; }
    if (customFields.length === 0) { alert('예약 정보 필드를 최소 1개 이상 추가해주세요.'); return; }

    const event: Event = {
      id: eventId,
      slug,
      title, description, venue, address,
      dates,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      timeSlots: DEFAULT_TIME_SLOT,
      customFields: normalizeBaseFields(customFields),
      status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    if (isEdit) { updateEvent(event); } else { addEvent(event); }
    navigate('/admin/events');
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/events')} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={22} className="text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-800 text-lg">{isEdit ? '행사 수정' : '새 행사 등록'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2">기본 정보</h3>

          <div>
            <label className={labelCls}>행사명 <span className="text-red-400">*</span></label>
            <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="예) 힐스테이트 판교역 입주박람회" required />
          </div>

          <div>
            <label className={labelCls}>행사 안내</label>
            <textarea className={inputCls} rows={4} value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="방문자에게 안내할 내용을 입력하세요&#10;(주차 안내, 준비물, 주의사항 등)" />
          </div>

          <div>
            <label className={labelCls}>장소명 <span className="text-red-400">*</span></label>
            <input className={inputCls} value={venue} onChange={e => setVenue(e.target.value)}
              placeholder="예) 힐스테이트 판교역 커뮤니티센터" required />
          </div>

          <div>
            <label className={labelCls}>주소</label>
            <input className={inputCls} value={address} onChange={e => setAddress(e.target.value)}
              placeholder="예) 경기도 성남시 분당구 판교역로 146" />
          </div>

          <div>
            <label className={labelCls}>행사 진행 시간</label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">시작</span>
                <TimePicker value={startTime} onChange={setStartTime} />
              </div>
              <span className="text-gray-300">~</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">종료</span>
                <TimePicker value={endTime} onChange={setEndTime} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>상태</label>
            <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as typeof status)}>
              <option value="active">예약 오픈</option>
              <option value="closed">예약 마감</option>
              <option value="draft">임시저장</option>
            </select>
          </div>

          {/* 예약 URL */}
          <div>
            <label className={labelCls}>예약 공유 URL</label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-mono text-gray-600 truncate">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={copyUrl}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 shrink-0"
                style={{ backgroundColor: urlCopied ? '#22c55e' : '#667EEA' }}
              >
                <Copy size={14} />
                {urlCopied ? '복사됨!' : 'URL 복사'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">이 링크를 방문 예약자에게 공유하세요</p>
          </div>
        </div>

        {/* 날짜 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2">예약 기간</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>시작일 <span className="text-red-400">*</span></label>
              <input type="date" className={inputCls} value={startDate}
                onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>종료일 <span className="text-red-400">*</span></label>
              <input type="date" className={inputCls} value={endDate}
                onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>
          {startDate && endDate && (
            <p className="text-xs text-gray-400">
              총 {generateDateRange(startDate, endDate).length}일간 예약 운영
            </p>
          )}
        </div>

        {/* 예약 정보 필드 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="font-bold text-gray-700 text-sm">예약 정보 필드</h3>
              <p className="text-xs text-gray-400 mt-0.5">방문자에게 수집할 정보를 설정하세요</p>
            </div>
            {!showAddField && (
              <button
                type="button"
                onClick={() => setShowAddField(true)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white font-semibold"
                style={{ backgroundColor: '#667EEA' }}
              >
                <Plus size={13} /> 필드 추가
              </button>
            )}
          </div>

          {/* 현재 필드 목록 */}
          <div className="space-y-2">
            {customFields.map((f) => (
              <div key={f.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <GripVertical size={14} className="text-gray-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-800">{f.label}</span>
                    <span className="text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      {FIELD_TYPE_LABELS[f.type]}
                    </span>
                    {f.required && (
                      <span className="text-xs text-red-400 font-semibold">필수</span>
                    )}
                  </div>
                  {f.options && f.options.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      선택지: {f.options.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {BASE_FIELD_KEYS.has(f.key) ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold border border-red-300 text-red-500 bg-red-50">
                      필수
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleRequired(f.id)}
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border transition-all ${
                        f.required
                          ? 'border-red-300 text-red-500 bg-red-50'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {f.required ? '필수' : '선택'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeField(f.id)}
                    disabled={BASE_FIELD_KEYS.has(f.key)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {customFields.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">필드를 추가해주세요</p>
            )}
          </div>

          {/* 새 필드 추가 폼 */}
          {showAddField && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
              <p className="text-xs font-bold text-gray-600">새 필드 추가</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">필드 이름 *</label>
                  <input
                    type="text"
                    placeholder="예) 동호수, 차량번호"
                    value={newField.label}
                    onChange={e => setNewField(p => ({ ...p, label: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">유형</label>
                  <select
                    value={newField.type}
                    onChange={e => setNewField(p => ({ ...p, type: e.target.value as CustomFieldType }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                  >
                    {(Object.entries(FIELD_TYPE_LABELS) as [CustomFieldType, string][]).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">안내 문구 (placeholder)</label>
                <input
                  type="text"
                  placeholder="예) 101동 501호"
                  value={newField.placeholder}
                  onChange={e => setNewField(p => ({ ...p, placeholder: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                />
              </div>
              {newField.type === 'select' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">선택지 (쉼표로 구분)</label>
                  <input
                    type="text"
                    placeholder="예) 30평형, 40평형, 50평형"
                    value={newField.options}
                    onChange={e => setNewField(p => ({ ...p, options: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={e => setNewField(p => ({ ...p, required: e.target.checked }))}
                  className="accent-[#667EEA]"
                />
                <span className="text-sm text-gray-600">필수 입력</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddField(false); setNewField({ label: '', type: 'text', required: false, placeholder: '', options: '' }); }}
                  className="flex-1 py-2 text-sm rounded-lg bg-white border border-gray-200 text-gray-600 font-medium"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={addCustomField}
                  disabled={!newField.label.trim()}
                  className="flex-1 py-2 text-sm rounded-lg text-white font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#667EEA' }}
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => navigate('/admin/events')}
            className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">
            취소
          </button>
          <button type="submit"
            className="flex-1 py-3 rounded-xl font-bold text-white hover:opacity-90"
            style={{ backgroundColor: '#667EEA' }}>
            {isEdit ? '수정 완료' : '행사 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
