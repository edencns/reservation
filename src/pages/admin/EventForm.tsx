import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateId } from '../../utils/helpers';
import type { Event, PriceCategory, TimeSlotDef, EventCategory } from '../../types';

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'concert', label: '콘서트' },
  { value: 'exhibition', label: '전시' },
  { value: 'sports', label: '스포츠' },
  { value: 'performance', label: '공연' },
  { value: 'conference', label: '컨퍼런스' },
  { value: 'other', label: '기타' },
];

const PRICE_COLORS = ['#FFD700', '#FF6B6B', '#91ADC2', '#95D5B2', '#F4A261', '#A8DADC'];

const defaultPricing: PriceCategory[] = [
  { category: 'VIP석', price: 100000, color: '#FFD700' },
  { category: 'R석', price: 80000, color: '#FF6B6B' },
];

const defaultTimeSlots: TimeSlotDef[] = [
  { id: generateId(), time: '14:00', maxCapacity: 100 },
  { id: generateId(), time: '19:00', maxCapacity: 100 },
];

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

export default function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getEventById, addEvent, updateEvent } = useApp();
  const isEdit = id !== undefined && id !== 'create';

  const existing = isEdit ? getEventById(id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [venue, setVenue] = useState(existing?.venue ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [category, setCategory] = useState<EventCategory>(existing?.category ?? 'performance');
  const [startDate, setStartDate] = useState(existing?.dates[0] ?? '');
  const [endDate, setEndDate] = useState(existing?.dates[existing?.dates.length - 1] ?? '');
  const [timeSlots, setTimeSlots] = useState<TimeSlotDef[]>(existing?.timeSlots ?? defaultTimeSlots);
  const [seatType, setSeatType] = useState<'numbered' | 'unnumbered'>(existing?.seatType ?? 'numbered');
  const [rows, setRows] = useState(existing?.rows ?? 10);
  const [seatsPerRow, setSeatsPerRow] = useState(existing?.seatsPerRow ?? 15);
  const [maxCapacity, setMaxCapacity] = useState(existing?.maxCapacity ?? 100);
  const [pricing, setPricing] = useState<PriceCategory[]>(existing?.pricing ?? defaultPricing);
  const [runningTime, setRunningTime] = useState(existing?.runningTime ?? '');
  const [ageLimit, setAgeLimit] = useState(existing?.ageLimit ?? '전체 이용가');
  const [status, setStatus] = useState<'active' | 'closed' | 'draft'>(existing?.status ?? 'active');

  const addTimeSlot = () =>
    setTimeSlots(prev => [...prev, { id: generateId(), time: '10:00', maxCapacity: 100 }]);
  const removeTimeSlot = (id: string) =>
    setTimeSlots(prev => prev.filter(t => t.id !== id));
  const updateTimeSlot = (id: string, key: keyof TimeSlotDef, value: string | number) =>
    setTimeSlots(prev => prev.map(t => t.id === id ? { ...t, [key]: value } : t));

  const addPricing = () =>
    setPricing(prev => [...prev, { category: '새 좌석', price: 50000, color: PRICE_COLORS[prev.length % PRICE_COLORS.length] }]);
  const removePricing = (idx: number) =>
    setPricing(prev => prev.filter((_, i) => i !== idx));
  const updatePricing = (idx: number, key: keyof PriceCategory, value: string | number) =>
    setPricing(prev => prev.map((p, i) => i === idx ? { ...p, [key]: value } : p));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dates = generateDateRange(startDate, endDate);
    if (dates.length === 0) { alert('날짜를 확인해주세요'); return; }
    if (timeSlots.length === 0) { alert('시간대를 추가해주세요'); return; }
    if (pricing.length === 0) { alert('가격을 추가해주세요'); return; }

    const event: Event = {
      id: isEdit ? id : generateId(),
      title, description, venue, address, category,
      dates, timeSlots, seatType, rows, seatsPerRow, maxCapacity,
      pricing, runningTime, ageLimit, status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (isEdit) { updateEvent(event); } else { addEvent(event); }
    navigate('/admin/events');
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#91ADC2]";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/events')}
          className="p-1.5 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={22} className="text-gray-600" />
        </button>
        <h2 className="font-bold text-gray-800 text-lg">{isEdit ? '이벤트 수정' : '새 이벤트 등록'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2">기본 정보</h3>
          <div><label className={labelCls}>이벤트명 *</label>
            <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><label className={labelCls}>카테고리</label>
            <select className={inputCls} value={category} onChange={e => setCategory(e.target.value as EventCategory)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select></div>
          <div><label className={labelCls}>설명</label>
            <textarea className={inputCls} rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>장소명 *</label>
              <input className={inputCls} value={venue} onChange={e => setVenue(e.target.value)} required /></div>
            <div><label className={labelCls}>주소</label>
              <input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>러닝타임</label>
              <input className={inputCls} placeholder="예) 2시간 30분" value={runningTime} onChange={e => setRunningTime(e.target.value)} /></div>
            <div><label className={labelCls}>관람 연령</label>
              <input className={inputCls} placeholder="전체 이용가" value={ageLimit} onChange={e => setAgeLimit(e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>상태</label>
            <select className={inputCls} value={status} onChange={e => setStatus(e.target.value as typeof status)}>
              <option value="active">진행중</option>
              <option value="closed">마감</option>
              <option value="draft">임시저장</option>
            </select></div>
        </div>

        {/* Dates & timeslots */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2">날짜 및 시간</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>시작일 *</label>
              <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
            <div><label className={labelCls}>종료일 *</label>
              <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} required /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">회차별 시간</label>
              <button type="button" onClick={addTimeSlot}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white font-medium"
                style={{ backgroundColor: '#91ADC2' }}>
                <Plus size={13} /> 추가
              </button>
            </div>
            <div className="space-y-2">
              {timeSlots.map(ts => (
                <div key={ts.id} className="flex gap-2 items-center">
                  <input type="time" className={`flex-1 ${inputCls}`} value={ts.time}
                    onChange={e => updateTimeSlot(ts.id, 'time', e.target.value)} />
                  <input type="number" className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#91ADC2]"
                    placeholder="최대인원" value={ts.maxCapacity}
                    onChange={e => updateTimeSlot(ts.id, 'maxCapacity', Number(e.target.value))} />
                  <button type="button" onClick={() => removeTimeSlot(ts.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seats */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2">좌석 설정</h3>
          <div className="flex gap-4">
            {(['numbered', 'unnumbered'] as const).map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={type} checked={seatType === type}
                  onChange={() => setSeatType(type)} className="accent-[#91ADC2]" />
                <span className="text-sm font-medium text-gray-700">
                  {type === 'numbered' ? '지정석' : '자유석'}
                </span>
              </label>
            ))}
          </div>
          {seatType === 'numbered' ? (
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>행 수 (A~Z)</label>
                <input type="number" className={inputCls} value={rows} min={1} max={26}
                  onChange={e => setRows(Number(e.target.value))} /></div>
              <div><label className={labelCls}>열 수 (좌석/행)</label>
                <input type="number" className={inputCls} value={seatsPerRow} min={1} max={50}
                  onChange={e => setSeatsPerRow(Number(e.target.value))} /></div>
            </div>
          ) : (
            <div><label className={labelCls}>최대 인원</label>
              <input type="number" className={inputCls} value={maxCapacity} min={1}
                onChange={e => setMaxCapacity(Number(e.target.value))} /></div>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-gray-700 text-sm">가격 설정</h3>
            <button type="button" onClick={addPricing}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#91ADC2' }}>
              <Plus size={13} /> 추가
            </button>
          </div>
          <div className="space-y-3">
            {pricing.map((p, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="color" value={p.color}
                  onChange={e => updatePricing(idx, 'color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#91ADC2]"
                  placeholder="좌석 종류" value={p.category}
                  onChange={e => updatePricing(idx, 'category', e.target.value)} />
                <input type="number" className="w-32 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#91ADC2]"
                  placeholder="가격" value={p.price}
                  onChange={e => updatePricing(idx, 'price', Number(e.target.value))} />
                <button type="button" onClick={() => removePricing(idx)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => navigate('/admin/events')}
            className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all">
            취소
          </button>
          <button type="submit"
            className="flex-1 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#91ADC2' }}>
            {isEdit ? '수정 완료' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
