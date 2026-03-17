import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate, generateId, normalizeUnitNumber, isValidEmail, isValidKoreanName, isValidPhone010 } from '../utils/helpers';
import { getVendorCategoryOptions } from '../utils/storage';
import type { Reservation } from '../types';

const MAX_SERVICES = 5;

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  unitNumber: string;
  agree: boolean;
}

export default function Reserve() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEventById, addReservation, reservations } = useApp();
  const event = getEventById(id ?? '');

  const [selectedDate, setSelectedDate] = useState('');
  const [customer, setCustomer] = useState<CustomerForm>({
    name: '', phone: '', email: '', unitNumber: '', agree: false,
  });
  const [interestedServices, setInterestedServices] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [unitDuplicate, setUnitDuplicate] = useState(false);
  const [completed, setCompleted] = useState<Reservation | null>(null);

  const serviceOptions = (event?.vendorCategories && event.vendorCategories.length > 0)
    ? event.vendorCategories.map(c => c.name)
    : getVendorCategoryOptions();

  const toggleService = (name: string) => {
    setInterestedServices(prev => {
      if (prev.includes(name)) return prev.filter(s => s !== name);
      if (prev.length >= MAX_SERVICES) return prev;
      return [...prev, name];
    });
  };

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface-variant">
      행사를 찾을 수 없습니다.
    </div>
  );

  const isValidName = isValidKoreanName(customer.name);
  const isValidPhone = isValidPhone010(customer.phone);
  const isValidMail = !customer.email || isValidEmail(customer.email);

  const getFieldError = (key: keyof CustomerForm): string | undefined => {
    const value = customer[key];
    const shouldShow = showErrors || (typeof value === 'string' && value.trim() !== '');
    if (!shouldShow) return undefined;
    if (key === 'name' && !isValidName) return '이름은 한글 2글자 이상으로 입력해주세요.';
    if (key === 'phone' && !isValidPhone) return '휴대폰 번호는 010으로 시작하는 11자리여야 합니다.';
    if (key === 'email' && !isValidMail) return '이메일 형식을 확인해주세요.';
    return undefined;
  };

  const canSubmit = isValidName && isValidPhone && isValidMail && customer.unitNumber && customer.agree && selectedDate !== '';

  const handleSubmit = () => {
    if (!selectedDate) { setShowErrors(true); return; }
    if (!isValidName || !isValidPhone || !isValidMail) { setShowErrors(true); return; }
    const normalizedUnit = normalizeUnitNumber(customer.unitNumber);
    const hasDuplicate = normalizedUnit !== '' && reservations.some(r =>
      r.eventId === event.id && r.date === selectedDate && r.status === 'confirmed'
      && normalizeUnitNumber(r.extraFields?.unitNumber ?? '') === normalizedUnit
    );
    if (hasDuplicate) { setUnitDuplicate(true); return; }
    const reservation: Reservation = {
      id: generateId(), eventId: event.id, eventTitle: event.title, venue: event.venue,
      address: event.address, date: selectedDate, time: '시간 미지정', timeSlotId: 'none',
      attendeeCount: 1, customer: { name: customer.name, phone: customer.phone, email: customer.email },
      extraFields: {
        unitNumber: customer.unitNumber,
        ...(interestedServices.length > 0 && { interestedServices: interestedServices.join(', ') }),
      },
      status: 'confirmed', checkedIn: false, createdAt: new Date().toISOString(),
    };
    addReservation(reservation);
    setCompleted(reservation);
  };

  // Completion state
  if (completed) {
    return (
      <div className="min-h-screen bg-surface pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
          <div className="mb-12">
            <p className="text-primary font-bold tracking-widest uppercase text-xs mb-4">예약 완료</p>
            <h1 className="text-5xl font-extrabold text-on-background max-w-2xl leading-tight">
              예약이 완료되었습니다!
            </h1>
          </div>
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">
              <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  <h2 className="text-xl font-bold">예약 확인</h2>
                </div>
                <div className="space-y-4 border-t border-outline-variant/20 pt-6">
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">apartment</span>
                    <div>
                      <p className="text-[10px] text-on-surface-variant opacity-70 uppercase font-bold tracking-widest mb-1">행사</p>
                      <p className="font-medium text-on-surface">{completed.eventTitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">event</span>
                    <div>
                      <p className="text-[10px] text-on-surface-variant opacity-70 uppercase font-bold tracking-widest mb-1">방문 날짜</p>
                      <p className="font-medium text-on-surface">{formatDate(completed.date)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <div>
                      <p className="text-[10px] text-on-surface-variant opacity-70 uppercase font-bold tracking-widest mb-1">예약 번호</p>
                      <p className="font-mono text-sm text-on-surface">{completed.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="flex-1 py-3.5 rounded-lg font-bold text-on-primary bg-primary hover:bg-primary-container transition-all shadow-md"
                >
                  내 예약 보기
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="flex-1 py-3.5 rounded-lg font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-all"
                >
                  목록으로
                </button>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <div className="sticky top-28 flex flex-col gap-8">
                <div className="p-10 rounded-xl text-on-primary shadow-xl" style={{background: 'linear-gradient(135deg, #00355f 0%, #0f4c81 100%)'}}>
                  <h3 className="text-2xl font-bold mb-8">예약 요약</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-primary-fixed-dim">apartment</span>
                      <div>
                        <p className="text-xs opacity-70 uppercase font-bold tracking-widest">동호수</p>
                        <p className="text-lg font-medium">{completed.extraFields?.unitNumber ?? '-'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-primary-fixed-dim">event</span>
                      <div>
                        <p className="text-xs opacity-70 uppercase font-bold tracking-widest">방문 날짜</p>
                        <p className="text-lg font-medium">{formatDate(completed.date)}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-primary-fixed-dim">verified_user</span>
                      <div>
                        <p className="text-xs opacity-70 uppercase font-bold tracking-widest">행사</p>
                        <p className="text-lg font-medium">{completed.eventTitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-high p-6 rounded-lg">
                  <p className="text-xs font-bold mb-4 uppercase text-on-surface-variant">현재 진행 단계</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-primary rounded-full relative shadow-[0_0_10px_rgba(45,97,151,0.5)]">
                      <div className="absolute inset-0 bg-surface-tint opacity-30 animate-pulse rounded-full"></div>
                    </div>
                    <div className="flex-1 h-3 bg-surface-container-highest rounded-full"></div>
                    <div className="flex-1 h-3 bg-surface-container-highest rounded-full"></div>
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                    <span className="text-primary">상담 예약</span>
                    <span>계약</span>
                    <span>입주</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
        {/* Header Section */}
        <div className="mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-xs mb-4">{event.title}</p>
          <h1 className="text-5xl font-extrabold text-on-background max-w-2xl leading-tight">
            박람회 방문 예약
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* Left Side: Reservation Form */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">

            {/* Personal Information Section */}
            <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
                <h2 className="text-xl font-bold">예약자 정보</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                    이름 <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={customer.name}
                    onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm text-on-surface focus:outline-none"
                  />
                  {getFieldError('name') && (
                    <p className="text-xs text-error mt-1.5">{getFieldError('name')}</p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                    휴대폰 번호 <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="01012345678 (- 없이 입력)"
                    value={customer.phone}
                    onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm text-on-surface focus:outline-none"
                  />
                  {getFieldError('phone') && (
                    <p className="text-xs text-error mt-1.5">{getFieldError('phone')}</p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={customer.email}
                    onChange={e => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm text-on-surface focus:outline-none"
                  />
                  {getFieldError('email') && (
                    <p className="text-xs text-error mt-1.5">{getFieldError('email')}</p>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                    동호수 <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예) 101동 501호"
                    value={customer.unitNumber}
                    onChange={e => {
                      setCustomer(prev => ({ ...prev, unitNumber: e.target.value }));
                      setUnitDuplicate(false);
                    }}
                    className="w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-sm text-on-surface focus:outline-none"
                  />
                  {unitDuplicate && (
                    <p className="text-xs text-error mt-1.5">이미 예약한 동호수 입니다.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Date Selection Section */}
            <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>calendar_month</span>
                <h2 className="text-xl font-bold">방문 날짜 선택</h2>
              </div>
              {showErrors && !selectedDate && (
                <p className="text-xs text-error mb-4">방문 날짜를 선택해주세요.</p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {event.dates.map(date => {
                  const d = new Date(date + 'T00:00:00');
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  const day = d.getDay();
                  const isSun = day === 0;
                  const isSat = day === 6;
                  const isSelected = selectedDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'bg-primary border-primary text-on-primary shadow-md'
                          : 'border-outline-variant bg-surface-container-lowest hover:border-primary/40'
                      }`}
                    >
                      <p className={`text-xs font-medium ${isSelected ? 'text-on-primary' : 'text-on-surface'}`}>
                        {d.getMonth() + 1}/{d.getDate()}
                      </p>
                      <p className={`text-[11px] font-semibold ${
                        isSelected ? 'text-on-primary/80'
                        : isSun ? 'text-error' : isSat ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {dayNames[day]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Service Interest Section */}
            <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
              <div className="flex items-baseline gap-2 mb-6">
                <h2 className="text-xl font-bold">관심 서비스</h2>
                <span className="text-xs text-outline">최대 {MAX_SERVICES}개</span>
                {interestedServices.length > 0 && (
                  <span className="text-xs font-bold ml-auto text-primary">{interestedServices.length}/{MAX_SERVICES}</span>
                )}
              </div>
              <div className="bg-surface-container-highest rounded-sm px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {serviceOptions.map(name => {
                  const checked = interestedServices.includes(name);
                  const disabled = !checked && interestedServices.length >= MAX_SERVICES;
                  return (
                    <label
                      key={name}
                      className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleService(name)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="text-sm text-on-surface">{name}</span>
                    </label>
                  );
                })}
              </div>
              {interestedServices.length >= MAX_SERVICES && (
                <p className="text-xs mt-1.5 text-primary">최대 {MAX_SERVICES}개까지 선택할 수 있습니다.</p>
              )}
            </section>

            {/* Privacy Agreement */}
            <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customer.agree}
                  onChange={e => setCustomer(prev => ({ ...prev, agree: e.target.checked }))}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm text-on-surface-variant">
                  개인정보 수집 및 이용에 동의합니다. <span className="text-error">*</span><br />
                  <span className="text-xs text-outline">수집 항목: 이름, 연락처, 이메일(선택), 동호수 / 목적: 방문 예약 확인 / 보유: 행사 종료 후 1개월</span>
                </span>
              </label>
            </section>
          </div>

          {/* Right Side: Summary & Action */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-28 flex flex-col gap-8">
              {/* Reservation Summary Card */}
              <div className="p-10 rounded-xl text-on-primary shadow-xl" style={{background: 'linear-gradient(135deg, #00355f 0%, #0f4c81 100%)'}}>
                <h3 className="text-2xl font-bold mb-8">예약 요약</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary-fixed-dim">apartment</span>
                    <div>
                      <p className="text-xs opacity-70 uppercase font-bold tracking-widest">동호수</p>
                      <p className="text-lg font-medium">
                        {customer.unitNumber || '동호수를 입력하세요'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary-fixed-dim">event</span>
                    <div>
                      <p className="text-xs opacity-70 uppercase font-bold tracking-widest">방문 날짜</p>
                      <p className="text-lg font-medium">
                        {selectedDate ? formatDate(selectedDate) : '날짜를 선택하세요'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary-fixed-dim">verified_user</span>
                    <div>
                      <p className="text-xs opacity-70 uppercase font-bold tracking-widest">행사</p>
                      <p className="text-lg font-medium">{event.title}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/20">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full bg-white text-primary font-bold py-4 rounded-md shadow-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    예약 완료하기
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <p className="text-center text-xs mt-4 opacity-60">
                    예약 완료 후 문자로 안내됩니다.
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-surface-container-high p-6 rounded-lg">
                <p className="text-xs font-bold mb-4 uppercase text-on-surface-variant">현재 진행 단계</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-primary rounded-full relative shadow-[0_0_10px_rgba(45,97,151,0.5)]">
                    <div className="absolute inset-0 bg-surface-tint opacity-30 animate-pulse rounded-full"></div>
                  </div>
                  <div className="flex-1 h-3 bg-surface-container-highest rounded-full"></div>
                  <div className="flex-1 h-3 bg-surface-container-highest rounded-full"></div>
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                  <span className="text-primary">상담 예약</span>
                  <span>계약</span>
                  <span>입주</span>
                </div>
              </div>

              {/* Informational Card */}
              <div className="bg-surface-container-low p-6 rounded-lg border-l-4 border-primary">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <div>
                    <h4 className="font-bold text-sm">일정 변경이 필요하신가요?</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                      예약 변경은 방문 24시간 전까지 가능합니다. 긴급 변경은 고객센터로 연락해 주세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
