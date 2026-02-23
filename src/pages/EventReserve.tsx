import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StepIndicator from '../components/StepIndicator';
import CustomFieldInput from '../components/CustomFieldInput';
import QRTicket from '../components/QRTicket';
import { formatDate, generateId } from '../utils/helpers';
import type { Reservation } from '../types';

const STEPS = ['날짜 선택', '예약 정보', '예약 완료'];

export default function EventReserve() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getEventBySlug, addReservation } = useApp();
  const event = getEventBySlug(slug ?? '');

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [completed, setCompleted] = useState<Reservation | null>(null);

  if (!event || event.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-bold text-gray-700">접근할 수 없는 페이지입니다</p>
          <button onClick={() => navigate(`/e/${slug}`)} className="mt-3 text-sm underline" style={{ color: '#667EEA' }}>
            행사 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const allRequiredFilled = event.customFields.filter(f => f.required).every(f => (fieldValues[f.key] ?? '').trim() !== '');

  const getFieldValue = (key: string) => fieldValues[key] ?? '';

  const canNext = (() => {
    if (step === 1) return selectedDate !== '';
    if (step === 2) return allRequiredFilled && agree;
    return false;
  })();

  const handleNext = () => {
    if (step === 2) {
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
    setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => step > 1 && step < 3 ? setStep(s => s - 1) : navigate(`/e/${slug}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">{event.title}</p>
            <p className="text-xs text-gray-400">{event.venue}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* Step 1: 날짜 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-5">방문 날짜를 선택하세요</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {event.dates.map(date => {
                const d = new Date(date + 'T00:00:00');
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const day = d.getDay();
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); }}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      selectedDate === date ? 'text-white border-transparent' : 'border-gray-200 hover:border-[#667EEA] bg-white'
                    }`}
                    style={selectedDate === date ? { backgroundColor: '#667EEA' } : {}}
                  >
                    <p className="text-xs font-medium">{d.getMonth() + 1}/{d.getDate()}</p>
                    <p className={`text-[11px] font-semibold ${
                      selectedDate === date ? 'text-white' : day === 0 ? 'text-red-500' : day === 6 ? 'text-blue-500' : 'text-gray-500'
                    }`}>{dayNames[day]}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: 예약 정보 (커스텀 필드) */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-1">예약 정보를 입력하세요</h2>
            <p className="text-sm text-gray-400 mb-5">{formatDate(selectedDate)}</p>

            <div className="space-y-4">
              {event.customFields.map(field => (
                <CustomFieldInput
                  key={field.id}
                  field={field}
                  value={fieldValues[field.key] ?? ''}
                  onChange={handleFieldChange}
                />
              ))}

              <label className="flex items-start gap-2.5 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="mt-0.5 accent-[#667EEA]"
                />
                <span className="text-sm text-gray-600">
                  개인정보 수집 및 이용에 동의합니다. <span className="text-red-400">*</span><br />
                  <span className="text-xs text-gray-400">
                    수집 항목: 입력한 정보 전체 / 목적: 방문 예약 확인 및 현장 운영 / 보유: 행사 종료 후 1개월
                  </span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: 완료 + QR */}
        {step === 3 && completed && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl"
                style={{ backgroundColor: '#667EEA' }}>✓</div>
              <h2 className="text-2xl font-extrabold text-gray-800">예약이 완료되었습니다!</h2>
              <p className="text-gray-500 mt-1 text-sm">아래 QR 티켓을 캡처하거나 저장해 두세요</p>
            </div>
            <QRTicket reservation={completed} extraFields={event.customFields} />
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/e/${slug}/ticket`)}
                className="flex-1 py-3.5 rounded-xl font-bold text-white hover:opacity-90"
                style={{ backgroundColor: '#667EEA' }}
              >
                내 예약 보기
              </button>
              <button
                onClick={() => navigate(`/e/${slug}`)}
                className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                행사 페이지로
              </button>
            </div>
          </div>
        )}

        {/* Next btn */}
        {step < 3 && (
          <div className="mt-6">
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: canNext ? '#667EEA' : undefined }}
            >
              {step === 2 ? '예약 완료하기' : '다음'} {step < 2 && <ChevronRight size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
