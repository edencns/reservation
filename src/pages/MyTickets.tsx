import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRTicket from '../components/QRTicket';
import type { Reservation } from '../types';
import { formatDate, formatCurrency } from '../utils/helpers';

export default function MyTickets() {
  const navigate = useNavigate();
  const { getUserReservations } = useApp();
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selected, setSelected] = useState<Reservation | null>(null);

  const reservations = submitted ? getUserReservations(submitted) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(phone.replace(/-/g, ''));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="py-10 text-center" style={{ backgroundColor: '#91ADC2' }}>
        <h1 className="text-3xl font-extrabold text-white mb-2">내 티켓</h1>
        <p className="text-blue-100 text-sm">예약한 티켓을 조회하세요</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Search form */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h2 className="font-bold text-gray-800 mb-4">휴대폰 번호로 예약 조회</h2>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="예) 01012345678"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#91ADC2]"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#91ADC2' }}
            >
              <Search size={16} /> 조회
            </button>
          </div>
        </form>

        {/* Results */}
        {submitted && (
          <>
            {reservations.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-4">🎫</p>
                <p className="font-medium">예약 내역이 없습니다</p>
                <button
                  onClick={() => navigate('/events')}
                  className="mt-4 px-6 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90"
                  style={{ backgroundColor: '#91ADC2' }}
                >
                  이벤트 예약하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">총 {reservations.length}건의 예약</p>
                {reservations.map(r => (
                  <div
                    key={r.id}
                    className={`bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all border-l-4 ${
                      r.status === 'cancelled' ? 'opacity-60 border-gray-300' : 'border-[#91ADC2]'
                    }`}
                    onClick={() => setSelected(r)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              r.status === 'confirmed' ? 'text-white' : 'bg-gray-100 text-gray-500'
                            }`}
                            style={r.status === 'confirmed' ? { backgroundColor: '#91ADC2' } : {}}
                          >
                            {r.status === 'confirmed' ? '예약확정' : '취소됨'}
                          </span>
                        </div>
                        <p className="font-bold text-gray-800 truncate">{r.eventTitle}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{formatDate(r.date)} {r.time}</p>
                        <p className="text-sm text-gray-500">{r.venue}</p>
                        <p className="text-sm font-semibold mt-1.5" style={{ color: '#91ADC2' }}>
                          {formatCurrency(r.totalAmount)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 shrink-0 ml-2">
                        QR 보기 &rsaquo;
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center"
            >
              <X size={18} className="text-gray-600" />
            </button>
            <QRTicket reservation={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
