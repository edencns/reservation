import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/helpers';

export default function EventTicket() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getEventBySlug, getEventReservationsByPhone } = useApp();
  const event = getEventBySlug(slug ?? '');

  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState('');

  // SMS 링크에서 넘어온 경우 전화번호 자동 입력 및 조회
  useEffect(() => {
    const p = searchParams.get('phone');
    if (p) {
      setPhone(p);
      setSubmitted(p.replace(/-/g, ''));
    }
  }, [searchParams]);
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">잘못된 링크입니다.</p>
      </div>
    );
  }

  const reservations = submitted
    ? getEventReservationsByPhone(event.id, submitted.replace(/-/g, ''))
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(phone);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="py-8 px-4 text-center" style={{ backgroundColor: '#667EEA' }}>
        <h1 className="text-2xl font-extrabold text-white mb-1">내 예약 확인</h1>
        <p className="text-blue-100 text-sm">{event.title}</p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/e/${slug}`)}
          className="flex items-center gap-1 text-sm mb-4"
          style={{ color: '#667EEA' }}
        >
          <ChevronLeft size={16} /> 행사 페이지로 돌아가기
        </button>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <h2 className="font-bold text-gray-800 mb-3 text-sm">예약 시 입력한 연락처로 조회하세요</h2>
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="연락처 입력 (예: 01012345678)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
            />
            <button
              type="submit"
              className="px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-1.5 hover:opacity-90 text-sm"
              style={{ backgroundColor: '#667EEA' }}
            >
              <Search size={15} /> 조회
            </button>
          </div>
        </form>

        {submitted && (
          <>
            {reservations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-3">📋</p>
                <p className="font-medium text-sm">예약 내역이 없습니다</p>
                <button
                  onClick={() => navigate(`/e/${slug}/reserve`)}
                  className="mt-4 px-5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90"
                  style={{ backgroundColor: '#667EEA' }}
                >
                  예약하기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">총 {reservations.length}건</p>
                {[...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(r => (
                  <div
                    key={r.id}
                    className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${
                      r.status === 'cancelled' ? 'opacity-60 border-gray-300' :
                      r.checkedIn ? 'border-green-400' : 'border-[#667EEA]'
                    }`}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          r.status === 'cancelled' ? 'bg-gray-100 text-gray-500' : 'text-white'
                        }`}
                        style={r.status === 'confirmed' ? { backgroundColor: '#667EEA' } : {}}
                      >
                        {r.status === 'confirmed' ? '예약확정' : '취소됨'}
                      </span>
                      {r.checkedIn && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">입장완료</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-800">{formatDate(r.date)} {r.time}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

       <footer className="w-full max-w-xl mx-auto px-4 py-8">
        <img
          src="https://storage.googleapis.com/maker-suite-attachments/v1/files/31a7b617-b038-4a6c-b9b5-a34657cdc234"
          alt="이든씨앤에스 로고"
          className="mx-auto"
          style={{ maxWidth: '200px' }}
        />
      </footer>
    </div>
  );
}
