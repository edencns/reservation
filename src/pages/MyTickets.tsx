import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

export default function MyTickets() {
  const navigate = useNavigate();
  const { getUserReservations } = useApp();
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState('');
  const reservations = submitted ? getUserReservations(submitted.replace(/-/g, '')) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(phone);
  };

  return (
    <div className="min-h-screen bg-surface pb-16">
      <div className="py-12 px-6 text-center bg-gradient-to-r from-primary to-primary-container">
        <h1 className="text-3xl font-extrabold text-white mb-2">내 예약</h1>
        <p className="text-primary-fixed-dim text-sm">휴대폰 번호로 예약 내역을 조회하세요</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-on-surface mb-4">예약 조회</h2>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="휴대폰 번호 입력 (예: 01012345678)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-primary text-on-primary font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Search size={16} /> 조회
            </button>
          </div>
        </form>

        {submitted && (
          <>
            {reservations.length === 0 ? (
              <div className="text-center py-16 text-outline">
                <p className="text-4xl mb-4">📋</p>
                <p className="font-medium">예약 내역이 없습니다</p>
                <button
                  onClick={() => navigate('/events')}
                  className="mt-4 px-6 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:opacity-90"
                >
                  방문 예약하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-on-surface-variant">총 {reservations.length}건의 예약</p>
                {[...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(r => (
                  <div
                    key={r.id}
                    className={`bg-surface-container-lowest rounded-xl shadow-sm p-5 border-l-4 ${
                      r.status === 'cancelled' ? 'opacity-60 border-outline-variant' : 'border-primary'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              r.status === 'confirmed'
                                ? 'bg-primary text-on-primary'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {r.status === 'confirmed' ? '예약확정' : '취소됨'}
                          </span>
                        </div>
                        <p className="font-bold text-on-surface truncate">{r.eventTitle}</p>
                        <p className="text-sm text-on-surface-variant mt-0.5">{r.venue}</p>
                        <p className="text-sm text-on-surface-variant">{formatDate(r.date)} · {r.time}</p>
                        <p className="text-sm font-semibold text-primary mt-1">
                          {r.customer.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
