import { useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';

export default function Events() {
  const { events } = useApp();
  const [search, setSearch] = useState('');
  const [showActive, setShowActive] = useState(true);

  const filtered = events.filter(e => {
    const matchSearch = e.title.includes(search) || e.venue.includes(search) || e.address.includes(search);
    const matchStatus = showActive ? e.status === 'active' : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10 text-center" style={{ backgroundColor: '#667EEA' }}>
        <h1 className="text-3xl font-extrabold text-white mb-2">방문 예약</h1>
        <p className="text-blue-100 text-sm">원하는 행사를 선택하고 방문 일시를 예약하세요</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="행사명, 장소, 주소 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showActive}
              onChange={e => setShowActive(e.target.checked)}
              className="rounded accent-[#667EEA]"
            />
            예약 가능한 행사만 보기
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🏢</p>
            <p className="text-lg font-medium">검색 결과가 없습니다</p>
            <p className="text-sm mt-1">다른 키워드로 검색해보세요</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">총 {filtered.length}개의 행사</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
