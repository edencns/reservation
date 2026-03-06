import { useOutletContext, useNavigate } from 'react-router-dom';
import { CalendarDays, FileText, Plus, ChevronRight } from 'lucide-react';
import { getEvents, getVendorContracts } from '../../utils/storage';
import { formatDate } from '../../utils/helpers';
import type { ManagedVendor, Event } from '../../types';

export default function VendorDashboard() {
  const { vendor } = useOutletContext<{ vendor: ManagedVendor }>();
  const navigate = useNavigate();

  const allEvents = getEvents();
  const allContracts = getVendorContracts();

  // 이 업체가 참여하는 행사 (event.vendors[]에 managedVendorId 일치)
  const myEvents: Event[] = allEvents.filter(e =>
    (e.vendors ?? []).some(v => v.managedVendorId === vendor.id)
  );

  const contractsByEvent = (eventId: string) =>
    allContracts.filter(c => c.vendorId === vendor.id && c.eventId === eventId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-gray-800 text-lg">안녕하세요, {vendor.name}님</h2>
        <p className="text-sm text-gray-400 mt-0.5">참여 중인 행사와 계약 현황을 확인하세요.</p>
      </div>

      {myEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
          <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">참여 중인 행사가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">관리자에게 문의해주세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myEvents.map(event => {
            const contracts = contractsByEvent(event.id);
            const completed = contracts.filter(c => c.status === 'completed').length;
            return (
              <div
                key={event.id}
                onClick={() => navigate(`/vendor/contracts?eventId=${event.id}`)}
                className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{event.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{event.venue}</p>
                    <p className="text-xs text-gray-400">
                      {event.dates.length > 0
                        ? `${formatDate(event.dates[0])}${event.dates.length > 1 ? ` ~ ${formatDate(event.dates[event.dates.length - 1])}` : ''}`
                        : '날짜 미정'}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0 mt-1" />
                </div>
                <div className="flex gap-3 mt-4">
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600">전체 <span className="font-bold text-gray-800">{contracts.length}</span>건</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-green-600">완료 <span className="font-bold">{completed}</span>건</span>
                  </div>
                  {contracts.length - completed > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-50 rounded-xl px-3 py-2">
                      <span className="text-xs text-yellow-700">임시저장 <span className="font-bold">{contracts.length - completed}</span>건</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myEvents.length > 0 && (
        <button
          onClick={() => navigate('/vendor/contracts/new')}
          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90"
          style={{ backgroundColor: '#667EEA' }}
        >
          <Plus size={18} /> 새 계약 작성
        </button>
      )}
    </div>
  );
}
