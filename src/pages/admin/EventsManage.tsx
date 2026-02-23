import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { categoryLabel, formatDate } from '../../utils/helpers';

export default function EventsManage() {
  const navigate = useNavigate();
  const { events, deleteEvent } = useApp();
  const handleDelete = (id: string) => {
    if (confirm('이 이벤트를 삭제하시겠습니까?')) {
      deleteEvent(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">이벤트 관리</h2>
        <button
          onClick={() => navigate('/admin/events/create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
          style={{ backgroundColor: '#91ADC2' }}
        >
          <Plus size={16} /> 새 이벤트
        </button>
      </div>

      {/* Desktop table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#FFDAB9' }}>
                {['이벤트명', '카테고리', '장소', '기간', '상태', '관리'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">이벤트가 없습니다</td></tr>
              ) : events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs">
                    <p className="truncate">{event.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{categoryLabel[event.category]}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="truncate">{event.venue}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <p>{formatDate(event.dates[0])}</p>
                    {event.dates.length > 1 && (
                      <p className="text-xs text-gray-400">~ {formatDate(event.dates[event.dates.length - 1])}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      event.status === 'active' ? 'bg-green-100 text-green-600'
                      : event.status === 'closed' ? 'bg-red-100 text-red-500'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                      {event.status === 'active' ? '진행중' : event.status === 'closed' ? '마감' : '임시저장'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        title="보기"
                      ><Eye size={15} /></button>
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                        title="수정"
                      ><Edit2 size={15} /></button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                        title="삭제"
                      ><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {events.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">이벤트가 없습니다</p>
          ) : events.map(event => (
            <div key={event.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-gray-800 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{event.venue}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  event.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {event.status === 'active' ? '진행중' : '마감'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{formatDate(event.dates[0])}</p>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/events/${event.id}`)}
                  className="flex-1 py-2 text-xs rounded-lg bg-gray-100 text-gray-600 font-medium">보기</button>
                <button onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                  className="flex-1 py-2 text-xs rounded-lg text-white font-medium"
                  style={{ backgroundColor: '#91ADC2' }}>수정</button>
                <button onClick={() => handleDelete(event.id)}
                  className="flex-1 py-2 text-xs rounded-lg bg-red-50 text-red-500 font-medium">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
