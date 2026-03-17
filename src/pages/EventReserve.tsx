import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CustomFieldInput from '../components/CustomFieldInput';
import { formatDate, generateId, normalizeUnitNumber, isValidEmail, isValidKoreanName, isValidPhone010 } from '../utils/helpers';
import type { Reservation } from '../types';

export default function EventReserve() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, addReservation, reservations } = useApp();
  const event = getEventBySlug(slug ?? '');

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [completed, setCompleted] = useState<Reservation | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [unitDuplicate, setUnitDuplicate] = useState(false);

  if (!event || event.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-outline text-3xl">lock</span>
          </div>
          <p className="font-headline font-bold text-on-surface text-lg mb-2">접근할 수 없는 페이지입니다</p>
          <button
            onClick={() => navigate(`/e/${slug}`)}
            className="mt-3 text-sm text-primary underline hover:text-primary-container transition-colors"
          >
            행사 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
    if (key === 'unitNumber') setUnitDuplicate(false);
  };

  const allRequiredFilled = event.customFields.filter(f => f.required).every(f => (fieldValues[f.key] ?? '').trim() !== '');
  const getFieldValue = (key: string) => fieldValues[key] ?? '';
  const nameValue = getFieldValue('name');
  const phoneValue = getFieldValue('phone');
  const emailValue = getFieldValue('email');
  const isValidName = isValidKoreanName(nameValue);
  const isValidPhone = isValidPhone010(phoneValue);
  const isValidMail = !emailValue || isValidEmail(emailValue);

  const getFieldError = (key: string): string | undefined => {
    const value = getFieldValue(key);
    const shouldShow = showErrors || value.trim() !== '';
    if (!shouldShow) return undefined;
    if (key === 'name' && !isValidName) return '이름은 한글 2글자 이상으로 입력해주세요.';
    if (key === 'phone' && !isValidPhone) return '휴대폰 번호는 010으로 시작하는 11자리여야 합니다.';
    if (key === 'email' && !isValidMail) return '이메일 형식을 확인해주세요.';
    if (key === 'unitNumber' && unitDuplicate) return '이미 예약한 동호수 입니다.';
    return undefined;
  };

  const canNext = (() => {
    if (step === 1) return selectedDate !== '';
    if (step === 2) return allRequiredFilled && agree && isValidName && isValidPhone && isValidMail;
    return false;
  })();

  const handleNext = () => {
    if (step === 2) {
      if (!isValidName || !isValidPhone || !isValidMail) {
        setShowErrors(true);
        return;
      }
      const normalizedUnit = normalizeUnitNumber(fieldValues.unitNumber ?? '');
      const hasDuplicate = normalizedUnit !== '' && reservations.some(r =>
        r.eventId === event.id
        && r.date === selectedDate
        && r.status === 'confirmed'
        && normalizeUnitNumber(r.extraFields?.unitNumber ?? '') === normalizedUnit
      );
      if (hasDuplicate) {
        setUnitDuplicate(true);
        return;
      }
      const customer = {
        name: getFieldValue('name'),
        phone: getFieldValue('phone'),
        email: getFieldValue('email'),
      };
      const reservation: Reservation = {
        id: generateId(),
        eventId: event.id,
        eventTitle: event.title,
        venue: event.venue,
        address: event.address,
        date: selectedDate,
        time: '시간 미지정',
        timeSlotId: 'none',
        attendeeCount: 1,
        customer,
        extraFields: fieldValues,
        status: 'confirmed',
        checkedIn: false,
        createdAt: new Date().toISOString(),
      };
      addReservation(reservation);
      setCompleted(reservation);
      setStep(3);
      return;
    }
    setShowErrors(false);
    setUnitDuplicate(false);
    setStep(s => s + 1);
  };

  /* ── Calendar helper for Step 1 ── */
  const buildCalendar = () => {
    if (!event.dates[0]) return null;
    const firstDate = new Date(event.dates[0] + 'T00:00:00');
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return { year, month, cells };
  };
  const calendar = buildCalendar();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased">

      <main className="max-w-7xl mx-auto px-8 md:px-16 py-20">

        {/* ─── Page Header ─── */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => step > 1 && step < 3 ? setStep(s => s - 1) : navigate(`/e/${slug}`)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <p className="text-primary font-bold tracking-widest uppercase text-xs">
              {step === 1 ? 'Step 1: 날짜 선택' : step === 2 ? 'Step 2: 예약 정보 입력' : '예약 완료'}
            </p>
          </div>
          <h1 className="text-5xl font-headline font-extrabold text-on-background max-w-2xl leading-tight">
            {step === 1 && <>방문 날짜를<br />선택하세요</>}
            {step === 2 && <>나만의 프리미엄<br />컨설팅 공간 확보</>}
            {step === 3 && <>예약이<br />완료되었습니다!</>}
          </h1>
        </div>

        {/* ─── Step 3: Completion ─── */}
        {step === 3 && completed && (
          <div className="max-w-2xl mx-auto">
            <div className="hero-gradient p-10 rounded-xl text-on-primary shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">예약 확인됨</h3>
                  <p className="text-sm opacity-70">예약 번호: {completed.id}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim">apartment</span>
                  <div>
                    <p className="text-xs opacity-70 uppercase font-bold tracking-widest">행사</p>
                    <p className="text-lg font-medium">{completed.eventTitle}</p>
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
                  <span className="material-symbols-outlined text-primary-fixed-dim">location_on</span>
                  <div>
                    <p className="text-xs opacity-70 uppercase font-bold tracking-widest">장소</p>
                    <p className="text-lg font-medium">{completed.venue}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim">person</span>
                  <div>
                    <p className="text-xs opacity-70 uppercase font-bold tracking-widest">예약자</p>
                    <p className="text-lg font-medium">{completed.customer.name}</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(`/e/${slug}/ticket`)}
                  className="flex-1 bg-white text-primary font-bold py-4 rounded-md shadow-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
                >
                  내 예약 보기
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate(`/e/${slug}`)}
                  className="flex-1 bg-white/10 text-on-primary font-bold py-4 rounded-md hover:bg-white/20 transition-colors"
                >
                  행사 페이지로
                </button>
              </div>
              <p className="text-center text-xs mt-4 opacity-60">
                예약 완료 후 확인 메시지가 전송됩니다.
              </p>
            </div>
          </div>
        )}

        {/* ─── Step 1 & 2: 2-Column Layout ─── */}
        {step < 3 && (
          <div className="grid grid-cols-12 gap-10">

            {/* ── Left Column ── */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">

              {/* Step 1: Date Selection */}
              {step === 1 && (
                <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                    <h2 className="text-xl font-bold">방문 날짜 선택</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Calendar View */}
                    <div>
                      <p className="text-sm font-semibold text-on-surface-variant mb-4">날짜를 선택하세요</p>
                      {calendar && (
                        <div className="bg-surface-container-low p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <span className="font-bold">{calendar.year}년 {calendar.month + 1}월</span>
                            <div className="flex gap-2">
                              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">chevron_left</span>
                              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">chevron_right</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 text-center text-xs font-bold text-on-surface-variant mb-2">
                            {dayNames.map(d => <span key={d}>{d}</span>)}
                          </div>
                          <div className="grid grid-cols-7 text-center gap-y-2">
                            {calendar.cells.map((day, i) => {
                              if (!day) return <span key={i} className="p-2" />;
                              const dateStr = `${calendar.year}-${String(calendar.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const isAvailable = event.dates.includes(dateStr);
                              const isSelected = selectedDate === dateStr;
                              return (
                                <span
                                  key={i}
                                  onClick={() => isAvailable && setSelectedDate(dateStr)}
                                  className={`p-2 rounded-full text-sm transition-all ${
                                    isSelected
                                      ? 'bg-primary text-on-primary'
                                      : isAvailable
                                      ? 'hover:bg-primary-fixed text-on-surface cursor-pointer font-medium'
                                      : 'text-surface-dim'
                                  }`}
                                >
                                  {day}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date Slot Buttons */}
                    <div>
                      <p className="text-sm font-semibold text-on-surface-variant mb-4">방문 가능 날짜</p>
                      <div className="flex flex-col gap-3">
                        {event.dates.map(date => {
                          const isSelected = selectedDate === date;
                          return (
                            <button
                              key={date}
                              onClick={() => setSelectedDate(date)}
                              className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-primary-container text-on-primary shadow-md'
                                  : 'bg-surface-container-low border border-transparent hover:border-primary-container'
                              }`}
                            >
                              <span className="font-medium">{formatDate(date)}</span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Step 2: Personal Information */}
              {step === 2 && (
                <>
                  <section className="bg-surface-container-lowest p-10 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                      <h2 className="text-xl font-bold">개인 정보</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {event.customFields.map(field => (
                        <div
                          key={field.id}
                          className={
                            field.type === 'multiselect' || field.type === 'select'
                              ? 'col-span-2'
                              : 'col-span-2 sm:col-span-1'
                          }
                        >
                          <CustomFieldInput
                            field={field}
                            value={fieldValues[field.key] ?? ''}
                            onChange={handleFieldChange}
                            error={getFieldError(field.key)}
                          />
                        </div>
                      ))}

                      {/* 관심 서비스 */}
                      {(event.vendorCategories?.length ?? 0) > 0 && (() => {
                        const MAX = 5;
                        const selected = (fieldValues['interestedServices'] ?? '')
                          .split(',').map(s => s.trim()).filter(Boolean);
                        return (
                          <div className="col-span-2 pt-1">
                            <div className="flex items-baseline gap-2 mb-3">
                              <label className="block text-sm font-semibold text-on-surface-variant">관심 서비스</label>
                              <span className="text-xs text-on-surface-variant">최대 {MAX}개 선택</span>
                              {selected.length > 0 && (
                                <span className="text-xs font-semibold text-primary ml-auto">{selected.length}/{MAX}</span>
                              )}
                            </div>
                            <div className="border border-outline-variant/30 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                              {event.vendorCategories!.map(cat => {
                                const checked = selected.includes(cat.name);
                                const disabled = !checked && selected.length >= MAX;
                                const toggle = () => {
                                  if (disabled) return;
                                  const next = checked
                                    ? selected.filter(s => s !== cat.name)
                                    : [...selected, cat.name];
                                  handleFieldChange('interestedServices', next.join(', '));
                                };
                                return (
                                  <label key={cat.id}
                                    className={`flex items-center gap-2 cursor-pointer group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={disabled}
                                      onChange={toggle}
                                      className="w-4 h-4 accent-primary rounded"
                                    />
                                    <span className="text-sm text-on-surface group-hover:text-on-background">{cat.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {selected.length >= MAX && (
                              <p className="text-xs text-primary mt-2">최대 {MAX}개까지 선택할 수 있습니다.</p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Privacy consent */}
                      <label className="col-span-2 flex items-start gap-2.5 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={agree}
                          onChange={e => setAgree(e.target.checked)}
                          className="mt-0.5 accent-primary"
                        />
                        <span className="text-sm text-on-surface-variant">
                          개인정보 수집 및 이용에 동의합니다. <span className="text-error">*</span><br />
                          <span className="text-xs">
                            수집 항목: 입력한 정보 전체 / 목적: 방문 예약 확인 및 현장 운영 / 보유: 행사 종료 후 1개월
                          </span>
                        </span>
                      </label>
                    </div>
                  </section>
                </>
              )}

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!canNext}
                className="w-full hero-gradient text-on-primary py-4 rounded-md font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {step === 2 ? '예약 완료하기' : '다음 단계로'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            {/* ── Right Column: Sticky Summary ── */}
            <div className="col-span-12 lg:col-span-5">
              <div className="sticky top-28 flex flex-col gap-8">

                {/* Reservation Summary Card */}
                <div className="hero-gradient p-10 rounded-xl text-on-primary shadow-xl">
                  <h3 className="text-2xl font-bold mb-8">예약 요약</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-primary-fixed-dim">apartment</span>
                      <div>
                        <p className="text-xs opacity-70 uppercase font-bold tracking-widest">행사</p>
                        <p className="text-lg font-medium">{event.title}</p>
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
                      <span className="material-symbols-outlined text-primary-fixed-dim">location_on</span>
                      <div>
                        <p className="text-xs opacity-70 uppercase font-bold tracking-widest">장소</p>
                        <p className="text-lg font-medium">{event.venue}</p>
                        <p className="text-sm opacity-80">{event.address}</p>
                      </div>
                    </div>
                    {step === 2 && fieldValues.name && (
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-primary-fixed-dim">verified_user</span>
                        <div>
                          <p className="text-xs opacity-70 uppercase font-bold tracking-widest">예약자</p>
                          <p className="text-lg font-medium">{fieldValues.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {step === 2 && (
                    <div className="mt-12 pt-8 border-t border-white/20">
                      <button
                        onClick={handleNext}
                        disabled={!canNext}
                        className="w-full bg-white text-primary font-bold py-4 rounded-md shadow-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        예약 확정하기
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                      <p className="text-center text-xs mt-4 opacity-60">
                        예약 완료 후 확인 메시지가 전송됩니다.
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="bg-surface-container-high p-6 rounded-lg">
                  <p className="text-xs font-bold mb-4 uppercase text-on-surface-variant tracking-wider">진행 단계</p>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-3 rounded-full relative ${step >= 1 ? 'bg-primary shadow-[0_0_10px_rgba(45,97,151,0.5)]' : 'bg-surface-container-highest'}`}>
                      {step === 1 && <div className="absolute inset-0 bg-surface-tint opacity-30 animate-pulse rounded-full"></div>}
                    </div>
                    <div className={`flex-1 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                    <div className={`flex-1 h-3 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                  </div>
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                    <span className={step >= 1 ? 'text-primary' : ''}>날짜 선택</span>
                    <span className={step >= 2 ? 'text-primary' : ''}>예약 정보</span>
                    <span className={step >= 3 ? 'text-primary' : ''}>완료</span>
                  </div>
                </div>

                {/* Informational Card */}
                <div className="bg-surface-container-low p-6 rounded-lg border-l-4 border-primary">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <div>
                      <h4 className="font-bold text-sm">일정 변경이 필요하신가요?</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                        예약 변경은 방문 24시간 전까지 가능합니다. 긴급한 변경은 고객 지원팀으로 문의해주세요.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
