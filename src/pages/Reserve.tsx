import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StepIndicator from '../components/StepIndicator';
import SeatMap from '../components/SeatMap';
import QRTicket from '../components/QRTicket';
import { formatDate, formatCurrency, generateId, getSeatPriceCategory } from '../utils/helpers';
import { getReservedSeats, addReservedSeats } from '../utils/storage';
import type { Reservation, PaymentMethod } from '../types';

const STEPS = ['날짜/시간', '좌석 선택', '예약자 정보', '결제', '예약 완료'];

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  agree: boolean;
}

export default function Reserve() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEventById, addReservation } = useApp();
  const event = getEventById(id ?? '');

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [selectedPriceCat, setSelectedPriceCat] = useState('');
  const [customer, setCustomer] = useState<CustomerForm>({ name: '', phone: '', email: '', agree: false });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);

  const reservedSeats = useMemo(() =>
    event && selectedDate && selectedTime
      ? getReservedSeats(event.id, selectedDate, selectedTime)
      : [],
    [event, selectedDate, selectedTime]
  );

  if (!event) return <div className="min-h-screen flex items-center justify-center text-gray-500">이벤트를 찾을 수 없습니다.</div>;

  const totalAmount = (() => {
    if (event.seatType === 'numbered') {
      return selectedSeats.reduce((sum, seatId) => {
        const [rowStr] = seatId.split('-');
        const rowIdx = rowStr.charCodeAt(0) - 65;
        const zone = getSeatPriceCategory(rowIdx, event.pricing);
        return sum + zone.price;
      }, 0);
    }
    const cat = event.pricing.find(p => p.category === selectedPriceCat) ?? event.pricing[0];
    return (cat?.price ?? 0) * attendeeCount;
  })();

  const handleToggleSeat = (seatId: string) => {
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const handleNext = () => {
    if (step === 4) {
      // Create reservation
      const reservation: Reservation = {
        id: generateId(),
        eventId: event.id,
        eventTitle: event.title,
        venue: event.venue,
        address: event.address,
        date: selectedDate,
        time: selectedTime,
        seatNumbers: event.seatType === 'numbered' ? selectedSeats : [],
        attendeeCount: event.seatType === 'unnumbered' ? attendeeCount : selectedSeats.length,
        customer: { name: customer.name, phone: customer.phone, email: customer.email },
        paymentMethod,
        totalAmount,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      if (event.seatType === 'numbered') {
        addReservedSeats(event.id, selectedDate, selectedTime, selectedSeats);
      }
      addReservation(reservation);
      setCompletedReservation(reservation);
      setStep(5);
      return;
    }
    setStep(prev => prev + 1);
  };

  const canNext = (() => {
    if (step === 1) return selectedDate !== '' && selectedTime !== '';
    if (step === 2) {
      if (event.seatType === 'numbered') return selectedSeats.length > 0;
      return attendeeCount > 0;
    }
    if (step === 3) return customer.name && customer.phone && customer.email && customer.agree;
    return true;
  })();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => step > 1 && step < 5 ? setStep(s => s - 1) : navigate(`/events/${event.id}`)}
            className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 truncate">{event.title}</p>
            <p className="text-xs text-gray-500">예약하기</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* Step 1: 날짜/시간 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-5">날짜 및 시간을 선택하세요</h2>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">공연 날짜</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {event.dates.slice(0, 30).map(date => {
                  const d = new Date(date + 'T00:00:00');
                  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  return (
                    <button
                      key={date}
                      onClick={() => { setSelectedDate(date); setSelectedSeats([]); }}
                      className={`p-2 rounded-xl border-2 text-center transition-all ${
                        selectedDate === date
                          ? 'text-white border-transparent'
                          : 'border-gray-200 hover:border-[#91ADC2] bg-white'
                      }`}
                      style={selectedDate === date ? { backgroundColor: '#91ADC2' } : {}}
                    >
                      <p className="text-xs font-medium">{d.getMonth() + 1}/{d.getDate()}</p>
                      <p className={`text-[10px] ${d.getDay() === 0 ? 'text-red-400' : d.getDay() === 6 ? 'text-blue-400' : ''} ${selectedDate === date ? 'text-white' : ''}`}>
                        {dayNames[d.getDay()]}
                      </p>
                    </button>
                  );
                })}
              </div>
              {event.dates.length > 30 && (
                <p className="text-xs text-gray-400 mt-2">+ {event.dates.length - 30}일 더 있음</p>
              )}
            </div>
            {selectedDate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">공연 시간</h3>
                <div className="flex flex-wrap gap-3">
                  {event.timeSlots.map(ts => (
                    <button
                      key={ts.id}
                      onClick={() => { setSelectedTime(ts.time); setSelectedSeats([]); }}
                      className={`px-5 py-3 rounded-xl border-2 font-semibold transition-all ${
                        selectedTime === ts.time
                          ? 'text-white border-transparent'
                          : 'border-gray-200 hover:border-[#91ADC2] bg-white'
                      }`}
                      style={selectedTime === ts.time ? { backgroundColor: '#91ADC2' } : {}}
                    >
                      {ts.time}
                      <span className="block text-xs font-normal opacity-70">최대 {ts.maxCapacity}명</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 좌석/인원 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-2">
              {event.seatType === 'numbered' ? '좌석을 선택하세요' : '관람 인원을 선택하세요'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {formatDate(selectedDate)} {selectedTime}
            </p>

            {event.seatType === 'numbered' ? (
              <>
                <SeatMap
                  rows={event.rows}
                  seatsPerRow={event.seatsPerRow}
                  pricing={event.pricing}
                  reservedSeats={reservedSeats}
                  selectedSeats={selectedSeats}
                  onToggle={handleToggleSeat}
                  maxSelect={10}
                />
                {selectedSeats.length > 0 && (
                  <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: '#91ADC211' }}>
                    <p className="text-sm font-semibold text-gray-700 mb-1">선택된 좌석</p>
                    <p className="text-sm text-gray-600">{selectedSeats.join(', ')}</p>
                    <p className="text-sm font-bold mt-2" style={{ color: '#91ADC2' }}>
                      합계: {formatCurrency(totalAmount)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">티켓 종류</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.pricing.map(p => (
                      <button
                        key={p.category}
                        onClick={() => setSelectedPriceCat(p.category)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedPriceCat === p.category
                            ? 'border-transparent text-white'
                            : 'border-gray-200 hover:border-[#91ADC2]'
                        }`}
                        style={selectedPriceCat === p.category ? { backgroundColor: '#91ADC2' } : {}}
                      >
                        <p className="font-bold">{p.category}</p>
                        <p className={`text-sm ${selectedPriceCat === p.category ? 'text-white/80' : 'text-gray-500'}`}>
                          {formatCurrency(p.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-semibold text-gray-600">인원</h3>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                    <button
                      onClick={() => setAttendeeCount(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-6 text-center text-lg">{attendeeCount}</span>
                    <button
                      onClick={() => setAttendeeCount(prev => Math.min(10, prev + 1))}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">명 (최대 10명)</span>
                </div>
                {selectedPriceCat && (
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#91ADC211' }}>
                    <p className="text-sm font-bold" style={{ color: '#91ADC2' }}>
                      합계: {formatCurrency(totalAmount)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: 예약자 정보 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-5">예약자 정보를 입력하세요</h2>
            <div className="space-y-4">
              {([
                { label: '이름', key: 'name', type: 'text', placeholder: '홍길동' },
                { label: '휴대폰 번호', key: 'phone', type: 'tel', placeholder: '01012345678' },
                { label: '이메일', key: 'email', type: 'email', placeholder: 'example@email.com' },
              ] as const).map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={customer[key]}
                    onChange={e => setCustomer(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#91ADC2] text-sm"
                  />
                </div>
              ))}
              <label className="flex items-start gap-2.5 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={customer.agree}
                  onChange={e => setCustomer(prev => ({ ...prev, agree: e.target.checked }))}
                  className="mt-0.5 accent-[#91ADC2]"
                />
                <span className="text-sm text-gray-600">
                  개인정보 수집 및 이용에 동의합니다. <span className="text-red-400">*</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 4: 결제 */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-5">결제 수단을 선택하세요</h2>

            {/* Summary */}
            <div className="rounded-xl p-4 mb-6 text-sm" style={{ backgroundColor: '#FFDAB9' }}>
              <p className="font-bold text-gray-800 mb-2">{event.title}</p>
              <p className="text-gray-600">{formatDate(selectedDate)} {selectedTime}</p>
              <p className="text-gray-600">
                {event.seatType === 'numbered' ? selectedSeats.join(', ') : `${attendeeCount}명`}
              </p>
              <p className="font-extrabold text-lg mt-3" style={{ color: '#5a7a8a' }}>
                {formatCurrency(totalAmount)}
              </p>
            </div>

            {/* Payment methods */}
            <div className="space-y-3">
              {([
                { method: 'card' as PaymentMethod, label: '신용카드', icon: '💳', desc: 'VISA / MasterCard / 국내 카드' },
                { method: 'bank' as PaymentMethod, label: '무통장 입금', icon: '🏦', desc: '입금 확인 후 예약 확정 (1~2시간 소요)' },
                { method: 'phone' as PaymentMethod, label: '휴대폰 결제', icon: '📱', desc: '월 결제 한도 내 간편 결제' },
              ]).map(({ method, label, icon, desc }) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                    paymentMethod === method ? 'border-transparent' : 'border-gray-200 hover:border-[#91ADC2]'
                  }`}
                  style={paymentMethod === method ? { borderColor: '#91ADC2', backgroundColor: '#91ADC211' } : {}}
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-bold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  {paymentMethod === method && (
                    <Check size={20} className="ml-auto" style={{ color: '#91ADC2' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: 완료 */}
        {step === 5 && completedReservation && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl"
                style={{ backgroundColor: '#91ADC2' }}>
                ✓
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800">예약이 완료되었습니다!</h2>
              <p className="text-gray-500 mt-1 text-sm">아래 QR 티켓을 저장하거나 스크린샷 해두세요</p>
            </div>
            <QRTicket reservation={completedReservation} />
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/my-tickets')}
                className="flex-1 py-3.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#91ADC2' }}
              >
                내 티켓 보기
              </button>
              <button
                onClick={() => navigate('/events')}
                className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                이벤트 목록
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div className="mt-6">
            <button
              onClick={handleNext}
              disabled={!canNext}
              className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{ backgroundColor: canNext ? '#91ADC2' : undefined }}
            >
              {step === 4 ? '결제하기' : '다음'}
              {step < 4 && <ChevronRight size={20} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
