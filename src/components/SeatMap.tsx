import { getRowLabel, getSeatId, getSeatPriceCategory } from '../utils/helpers';
import type { PriceCategory } from '../types';

interface Props {
  rows: number;
  seatsPerRow: number;
  pricing: PriceCategory[];
  reservedSeats: string[];
  selectedSeats: string[];
  onToggle: (seatId: string) => void;
  maxSelect?: number;
}

export default function SeatMap({ rows, seatsPerRow, pricing, reservedSeats, selectedSeats, onToggle, maxSelect = 10 }: Props) {
  return (
    <div className="overflow-x-auto">
      {/* Stage */}
      <div className="flex justify-center mb-6">
        <div
          className="px-16 py-2 rounded-t-3xl text-white text-sm font-semibold tracking-widest"
          style={{ backgroundColor: '#91ADC2' }}
        >
          STAGE
        </div>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col items-center gap-1">
        {Array.from({ length: rows }, (_, rowIdx) => {
          const rowLabel = getRowLabel(rowIdx);
          const zone = getSeatPriceCategory(rowIdx, pricing);
          return (
            <div key={rowIdx} className="flex items-center gap-1">
              <span className="text-xs text-gray-400 w-5 text-right mr-1 shrink-0">{rowLabel}</span>
              {Array.from({ length: seatsPerRow }, (_, seatIdx) => {
                const seatNum = seatIdx + 1;
                const seatId = getSeatId(rowIdx, seatNum);
                const isReserved = reservedSeats.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const canSelect = !isReserved && (isSelected || selectedSeats.length < maxSelect);

                return (
                  <button
                    key={seatId}
                    title={`${rowLabel}-${seatNum} (${zone.category} ${zone.price.toLocaleString()}원)`}
                    onClick={() => canSelect && onToggle(seatId)}
                    disabled={isReserved}
                    className={`w-6 h-5 rounded-sm text-[9px] font-semibold transition-all border ${
                      isReserved
                        ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'text-white border-transparent scale-110'
                        : canSelect
                        ? 'border-gray-300 hover:scale-110 cursor-pointer'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: '#91ADC2' }
                        : !isReserved
                        ? { backgroundColor: zone.color + '55', borderColor: zone.color }
                        : {}
                    }
                  >
                    {seatNum}
                  </button>
                );
              })}
              <span className="text-xs text-gray-400 w-5 ml-1 shrink-0">{rowLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {pricing.map(p => (
          <div key={p.category} className="flex items-center gap-1.5 text-xs">
            <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: p.color + '55', borderColor: p.color }} />
            <span className="text-gray-600">{p.category}</span>
            <span className="font-semibold text-gray-700">{p.price.toLocaleString()}원</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-4 h-4 rounded-sm bg-gray-200 border border-gray-300" />
          <span className="text-gray-500">예매완료</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-4 h-4 rounded-sm border border-transparent" style={{ backgroundColor: '#91ADC2' }} />
          <span className="text-gray-500">선택됨</span>
        </div>
      </div>
    </div>
  );
}
