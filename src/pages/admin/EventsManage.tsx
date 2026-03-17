import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink, ClipboardList, Monitor, Download, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { exportToExcel } from '../../utils/exportExcel';

const STATUS_OPTS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '오픈' },
  { value: 'closed', label: '마감' },
  { value: 'draft', label: '임시저장' },
];

export default function EventsManage() {
  const navigate = useNavigate();
  const { events, deleteEvent, reservations } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => events.filter(e => {
    const matchSearch = !search || e.title.includes(search) || e.venue.includes(search);
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [events, search, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('이 행사를 삭제하시겠습니까? 관련 예약 내역이 모두 삭제됩니다.')) {
      deleteEvent(id);
    }
  };

  const handleExport = () => {
    const data = filtered.map(e => {
      const confirmed = reservations.filter(r => r.eventId === e.id && r.status === 'confirmed').length;
      const cancelled = reservations.filter(r => r.eventId === e.id && r.status === 'cancelled').length;
      return {
        '행사명': e.title,
        '장소': e.venue,
        '시작일': formatDate(e.dates[0]),
        '종료일': e.dates.length > 1 ? formatDate(e.dates[e.dates.length - 1]) : formatDate(e.dates[0]),
        '상태': e.status === 'active' ? '오픈' : e.status === 'closed' ? '마감' : '임시저장',
        '확정 예약': confirmed,
        '취소 예약': cancelled,
        '전체 예약': confirmed + cancelled,
        '슬러그': e.slug,
      };
    });
    exportToExcel('행사관리', [{ name: '행사 목록', data }]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-on-surface">행사 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container"
          >
            <Download size={15} /> 엑셀
          </button>
          <button
            onClick={() => navigate('/admin/events/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90"
          >
            <Plus size={16} /> 새 행사 등록
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder="행사명, 장소 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant rounded-xl text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_OPTS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === f.value
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-on-surface-variant">총 {filtered.length}건</p>

      {/* Desktop table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low">
                {['행사명', '기간', '예약 수', '상태', '관리'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-on-surface-variant text-[10px] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-on-surface-variant">등록된 행사가 없습니다</td></tr>
              ) : filtered.map(event => {
                const confirmed = reservations.filter(r => r.eventId === event.id && r.status === 'confirmed').length;
                return (
                  <tr key={event.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface whitespace-nowrap">
                      {event.title}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                      <p className="text-xs">{formatDate(event.dates[0])}</p>
                      {event.dates.length > 1 && (
                        <p className="text-xs text-outline">~ {formatDate(event.dates[event.dates.length - 1])}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">
                      {confirmed}건
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        event.status === 'active' ? 'bg-primary/10 text-primary'
                        : event.status === 'closed' ? 'bg-red-100 text-red-500'
                        : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        {event.status === 'active' ? '오픈' : event.status === 'closed' ? '마감' : '임시저장'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 items-center">
                        <button onClick={() => navigate(`/e/${event.slug}`)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="행사 페이지">
                          <ExternalLink size={15} />
                        </button>
                        <button onClick={() => navigate(`/admin/reservations?eventId=${event.id}`)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" title="예약 보기">
                          <ClipboardList size={15} />
                        </button>
                        <button onClick={() => window.open(`/kiosk/${event.id}`, '_blank')}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary" title="키오스크 열기">
                          <Monitor size={15} />
                        </button>
                        <button onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary" title="수정">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(event.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500" title="삭제">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-outline-variant/10">
          {filtered.length === 0 ? (
            <p className="text-center py-10 text-on-surface-variant text-sm">등록된 행사가 없습니다</p>
          ) : filtered.map(event => {
            const confirmed = reservations.filter(r => r.eventId === event.id && r.status === 'confirmed').length;
            return (
              <div key={event.id} className="p-4">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="font-bold text-on-surface flex-1 pr-2 truncate">{event.title}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    event.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {event.status === 'active' ? '오픈' : '마감'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">{event.venue}</p>
                <p className="text-xs text-outline mt-0.5">{formatDate(event.dates[0])}</p>
                <p className="text-xs font-semibold mt-1 text-primary">예약 {confirmed}건</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={() => navigate(`/admin/reservations?eventId=${event.id}`)}
                    className="flex-1 py-2 text-xs rounded-lg bg-surface-container text-on-surface-variant font-medium">예약 보기</button>
                  <button onClick={() => window.open(`/kiosk/${event.id}`, '_blank')}
                    className="flex-1 py-2 text-xs rounded-lg font-medium bg-primary text-on-primary">키오스크</button>
                  <button onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                    className="flex-1 py-2 text-xs rounded-lg bg-primary/10 text-primary font-medium">수정</button>
                  <button onClick={() => handleDelete(event.id)}
                    className="flex-1 py-2 text-xs rounded-lg bg-red-50 text-red-500 font-medium">삭제</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
