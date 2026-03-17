import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, User, MapPin, Info, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StepIndicator from '../components/StepIndicator';
import { formatDate, generateId, normalizeUnitNumber, isValidEmail, isValidKoreanName, isValidPhone010 } from '../utils/helpers';
import { getVendorCategoryOptions } from '../utils/storage';
import type { Reservation } from '../types';

const MAX_SERVICES = 5;
const STEPS = ['날짜 선택', '예약자 정보', '예약 완료'];

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

  const [step, setStep] = useState(1);
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

  const canNext = (() => {
    if (step === 1) return selectedDate !== '';
    if (step === 2) return isValidName && isValidPhone && isValidMail && customer.unitNumber && customer.agree;
    return false;
  })();

  const handleNext = () => {
    if (step === 2) {
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
      setStep(3);
      return;
    }
    setShowErrors(false);
    setUnitDuplicate(false);
    setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => step > 1 && step < 3 ? setStep(s => s - 1) : navigate(`/events/${event.id}`)}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
          >
            <ChevronLeft size={22} className="text-on-surface" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-on-surface truncate text-sm">{event.title}</p>
            <p className="text-xs text-on-surface-variant">{event.venue}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* Step 1: 날짜 선택 */}
        {step === 1 && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6 shadow-[0_40px_60px_-20px_rgba(25,28,30,0.04)]">
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={20} className="text-primary" />
              <h2 className="font-headline font-bold text-on-surface text-lg">방문 날짜를 선택하세요</h2>
            </div>
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
          </div>
        )}

        {/* Step 2: 예약자 정보 */}
        {step === 2 && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6 shadow-[0_40px_60px_-20px_rgba(25,28,30,0.04)]">
            <div className="flex items-center gap-3 mb-2">
              <User size={20} className="text-primary" />
              <h2 className="font-headline font-bold text-on-surface text-lg">예약자 정보를 입력하세요</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6 p-3 rounded-lg bg-surface-container-low">
              <Calendar size={14} className="text-primary shrink-0" />
              <span>{formatDate(selectedDate)} 방문</span>
            </div>

            <div className="space-y-5">
              {([
                { label: '이름', key: 'name' as const, type: 'text', placeholder: '홍길동', required: true },
                { label: '휴대폰 번호', key: 'phone' as const, type: 'tel', placeholder: '01012345678 (- 없이 입력)', required: true },
                { label: '이메일', key: 'email' as const, type: 'email', placeholder: 'example@email.com', required: false },
                { label: '동호수', key: 'unitNumber' as const, type: 'text', placeholder: '예) 101동 501호', required: true },
              ]).map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    {label} {required && <span className="text-error">*</span>}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={customer[key] as string}
                    onChange={e => {
                      setCustomer(prev => ({ ...prev, [key]: e.target.value }));
                      if (key === 'unitNumber') setUnitDuplicate(false);
                    }}
                    className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  />
                  {getFieldError(key) && (
                    <p className="text-xs text-error mt-1.5">{getFieldError(key)}</p>
                  )}
                  {key === 'unitNumber' && unitDuplicate && (
                    <p className="text-xs text-error mt-1.5">이미 예약한 동호수 입니다.</p>
                  )}
                </div>
              ))}

              {/* 관심 서비스 */}
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">관심 서비스</label>
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
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer mt-2">
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
            </div>
          </div>
        )}

        {/* Step 3: 완료 */}
        {step === 3 && completed && (
          <div>
            {/* 요약 카드 */}
            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-on-primary shadow-xl mb-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle size={28} className="text-primary-fixed-dim" />
                <h2 className="font-headline text-2xl font-extrabold">예약이 완료되었습니다!</h2>
              </div>
              <div className="space-y-4 border-t border-white/20 pt-6">
                <div className="flex gap-4">
                  <MapPin size={18} className="text-primary-fixed-dim shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest mb-1">행사</p>
                    <p className="font-medium">{completed.eventTitle}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Calendar size={18} className="text-primary-fixed-dim shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest mb-1">방문 날짜</p>
                    <p className="font-medium">{formatDate(completed.date)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Info size={18} className="text-primary-fixed-dim shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest mb-1">예약 번호</p>
                    <p className="font-mono text-sm">{completed.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 진행 단계 표시 */}
            <div className="bg-surface-container-high p-5 rounded-lg mb-6">
              <p className="text-xs font-bold mb-3 uppercase text-on-surface-variant">현재 진행 단계</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-primary rounded-full relative shadow-[0_0_10px_rgba(45,97,151,0.4)]">
                  <div className="absolute inset-0 bg-surface-tint opacity-30 animate-pulse rounded-full" />
                </div>
                <div className="flex-1 h-2.5 bg-surface-container-highest rounded-full" />
                <div className="flex-1 h-2.5 bg-surface-container-highest rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">
                <span className="text-primary">상담 예약</span>
                <span>계약</span>
                <span>입주</span>
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
        )}

        {/* Next button */}
        {step < 3 && (
          <div className="mt-6">
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="w-full py-4 rounded-lg font-bold text-on-primary text-base flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-primary to-primary-container shadow-xl hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {step === 2 ? '예약 완료하기' : '다음'}
              {step < 2 && <ChevronRight size={20} />}
            </button>
          </div>
        )}

        {/* 안내 카드 */}
        {step < 3 && (
          <div className="mt-4 bg-surface-container-low p-4 rounded-lg border-l-4 border-primary">
            <div className="flex gap-2">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-on-surface">일정 변경이 필요하신가요?</p>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                  예약 변경은 방문 24시간 전까지 가능합니다. 긴급 변경은 고객센터로 연락해 주세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
