import { useOutletContext, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getVendorContracts } from '../../utils/storage';
import { formatDate } from '../../utils/helpers';
import type { ManagedVendor } from '../../types';

const STATUS_LABEL: Record<string, string> = {
  active: '진행 중',
  closed: '종료',
  draft: '준비 중',
};
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-600',
  closed: 'bg-gray-100 text-gray-500',
  draft: 'bg-yellow-100 text-yellow-600',
};

export default function VendorEventsView() {
  const { vendor } = useOutletContext<{ vendor: ManagedVendor }>();
  const navigate = useNavigate();
  const { events } = useApp();
  const allContracts = getVendorContracts();

  // 이 업체가 참여하는 행사만 (event.vendors[]에 managedVendorId 일치)
  const myEvents = events.filter(e =>
    (e.vendors ?? []).some(v => v.managedVendorId === vendor.id)
  );

  const contractCount = (eventId: string) =>
    allContracts.filter(c => c.vendorId === vendor.id && c.eventId === eventId).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-gray-800">이벤트 현황</h2>
        <p className="text-sm text-gray-400 mt-0.5">참여 중인 행사 목록입니다.</p>
      </div>

      {myEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <CalendarDays size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">참여 중인 행사가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">관리자에게 문의해주세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myEvents.map(event => {
            const dateRange = event.dates.length > 0
              ? event.dates.length === 1
                ? formatDate(event.dates[0])
                : `${formatDate(event.dates[0])} ~ ${formatDate(event.dates[event.dates.length - 1])}`
              : '날짜 미정';
            const count = contractCount(event.id);

            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-gray-800 text-lg leading-snug">{event.title}</h3>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[event.status]}`}>
                      {STATUS_LABEL[event.status]}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-300 shrink-0" />
                      <span>{dateRange}</span>
                      {event.startTime && event.endTime && (
                        <span className="text-gray-400">{event.startTime} ~ {event.endTime}</span>
                      )}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-300 shrink-0 mt-0.5" />
                      <div>
                        <p>{event.venue}</p>
                        {event.address && <p className="text-xs text-gray-400">{event.address}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="text-sm">
                      <span className="text-gray-400">계약 </span>
                      <span className="font-bold text-gray-800">{count}건</span>
                    </div>
                    <div className="flex gap-2">
                      {count > 0 && (
                        <button
                          onClick={() => navigate(`/vendor/contracts?eventId=${event.id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          계약 확인
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/vendor/contracts/new?eventId=${event.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90"
                        style={{ backgroundColor: '#667EEA' }}
                      >
                        <Plus size={14} /> 계약 작성
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
