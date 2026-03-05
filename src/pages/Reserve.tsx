import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StepIndicator from '../components/StepIndicator';
import QRTicket from '../components/QRTicket';
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
    name: '',
    phone: '',
    email: '',
    unitNumber: '',
    agree: false,
  });
  const [interestedServices, setInterestedServices] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [unitDuplicate, setUnitDuplicate] = useState(false);
  const [completed, setCompleted] = useState<Reservation | null>(null);

  // 행사 카테고리 or 전역 카테고리 옵션
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
    <div className="min-h-screen flex items-center justify-center text-gray-500">행사를 찾을 수 없습니다.</div>
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
        if (!isValidName || !isValidPhone || !isValidMail) {
          setShowErrors(true);
          return;
        }
        const normalizedUnit = normalizeUnitNumber(customer.unitNumber);
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
          customer: { name: customer.name, phone: customer.phone, email: customer.email },
          extraFields: {
            unitNumber: customer.unitNumber,
            ...(interestedServices.length > 0 && { interestedServices: interestedServices.join(', ') }),
          },
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => step > 1 && step < 3 ? setStep(s => s - 1) : navigate(`/events/${event.id}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 truncate text-sm">{event.title}</p>
            <p className="text-xs text-gray-400">{event.venue}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* Step 1: 날짜 선택 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-5">방문 날짜를 선택하세요</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {event.dates.map(date => {
                const d = new Date(date + 'T00:00:00');
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const day = d.getDay();
                const isSun = day === 0;
                const isSat = day === 6;
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); }}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      selectedDate === date
                        ? 'text-white border-transparent'
                        : 'border-gray-200 hover:border-[#667EEA] bg-white'
                    }`}
                    style={selectedDate === date ? { backgroundColor: '#667EEA' } : {}}
                  >
                    <p className="text-xs font-medium">{d.getMonth() + 1}/{d.getDate()}</p>
                    <p className={`text-[11px] font-semibold ${
                      selectedDate === date ? 'text-white' : isSun ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-gray-500'
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
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-1">예약자 정보를 입력하세요</h2>
            <div className="text-sm text-gray-400 mb-5 p-3 rounded-xl bg-gray-50">
              {formatDate(selectedDate)} 방문
            </div>

            <div className="space-y-4">
              {([
                { label: '이름', key: 'name' as const, type: 'text', placeholder: '홍길동', required: true },
                { label: '휴대폰 번호', key: 'phone' as const, type: 'tel', placeholder: '01012345678 (- 없이 입력)', required: true },
                { label: '이메일', key: 'email' as const, type: 'email', placeholder: 'example@email.com', required: false },
                { label: '동호수', key: 'unitNumber' as const, type: 'text', placeholder: '예) 101동 501호', required: true },
              ]).map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={customer[key]}
                    onChange={e => {
                      setCustomer(prev => ({ ...prev, [key]: e.target.value }));
                      if (key === 'unitNumber') setUnitDuplicate(false);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667EEA] text-sm"
                  />
                  {getFieldError(key) && (
                    <p className="text-xs text-red-500 mt-1.5">{getFieldError(key)}</p>
                  )}
                  {key === 'unitNumber' && unitDuplicate && (
                    <p className="text-xs text-red-500 mt-1.5">이미 예약한 동호수 입니다.</p>
                  )}
                </div>
              ))}

              {/* 관심 서비스 */}
              <div className="pt-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <label className="block text-sm font-semibold text-gray-700">관심 서비스</label>
                  <span className="text-xs text-gray-400">최대 {MAX_SERVICES}개 선택</span>
                  {interestedServices.length > 0 && (
                    <span className="text-xs font-semibold ml-auto" style={{ color: '#667EEA' }}>
                      {interestedServices.length}/{MAX_SERVICES}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {serviceOptions.map(name => {
                    const checked = interestedServices.includes(name);
                    const disabled = !checked && interestedServices.length >= MAX_SERVICES;
                    return (
                      <label
                        key={name}
                        className={`flex items-center gap-2 cursor-pointer group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleService(name)}
                          className="w-4 h-4 accent-[#667EEA] rounded"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{name}</span>
                      </label>
                    );
                  })}
                </div>
                {interestedServices.length >= MAX_SERVICES && (
                  <p className="text-xs mt-2" style={{ color: '#667EEA' }}>최대 {MAX_SERVICES}개까지 선택할 수 있습니다.</p>
                )}
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={customer.agree}
                  onChange={e => setCustomer(prev => ({ ...prev, agree: e.target.checked }))}
                  className="mt-0.5 accent-[#667EEA]"
                />
                <span className="text-sm text-gray-600">
                  개인정보 수집 및 이용에 동의합니다. <span className="text-red-400">*</span><br />
                  <span className="text-xs text-gray-400">수집 항목: 이름, 연락처, 이메일(선택), 동호수 / 목적: 방문 예약 확인 / 보유: 행사 종료 후 1개월</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: 완료 */}
        {step === 3 && completed && (
          <div>
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl"
                style={{ backgroundColor: '#667EEA' }}
              >
                ✓
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800">예약이 완료되었습니다!</h2>
              <p className="text-gray-500 mt-1 text-sm">아래 QR 티켓을 캡처하거나 저장해 두세요</p>
            </div>
            <QRTicket reservation={completed} />
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/my-tickets')}
                className="flex-1 py-3.5 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#667EEA' }}
              >
                내 예약 보기
              </button>
              <button
                onClick={() => navigate('/events')}
                className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: canNext ? '#667EEA' : undefined }}
            >
              {step === 2 ? '예약 완료하기' : '다음'}
              {step < 2 && <ChevronRight size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
