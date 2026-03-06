import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Pencil } from 'lucide-react';
import { getVendorContracts } from '../../utils/storage';
import type { ManagedVendor } from '../../types';

const TYPE_LABEL: Record<string, string> = { electronic: '전자계약서', upload: '파일 업로드' };
const STATUS_LABEL: Record<string, string> = { draft: '임시저장', completed: '완료' };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 text-sm last:border-0">
      <span className="text-gray-400 shrink-0 w-24">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
}

export default function ContractView() {
  const { vendor } = useOutletContext<{ vendor: ManagedVendor }>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const contract = getVendorContracts().find(c => c.id === id && c.vendorId === vendor.id);

  if (!contract) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">계약을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/vendor/contracts')} className="mt-3 text-sm underline" style={{ color: '#667EEA' }}>
          목록으로
        </button>
      </div>
    );
  }

  const balance = contract.totalAmount - contract.depositAmount;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/vendor/contracts')} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <h2 className="font-bold text-gray-800 text-lg">계약 내용 확인</h2>
        </div>
        <button
          onClick={() => navigate(`/vendor/contracts/${id}/edit`)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
          style={{ backgroundColor: '#667EEA' }}
        >
          <Pencil size={14} /> 수정
        </button>
      </div>

      {/* 상태 배지 */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          contract.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {STATUS_LABEL[contract.status]}
        </span>
        <span className="text-xs text-gray-400">{TYPE_LABEL[contract.type]}</span>
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(contract.createdAt).toLocaleDateString('ko-KR')} 작성
        </span>
      </div>

      {/* 행사 / 계약 기본 정보 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">계약 기본 정보</h3>
        <Row label="행사명" value={contract.eventTitle} />
        <Row label="계약 날짜" value={contract.contractDate} />
        <Row label="업체명" value={`${contract.vendorName} (${contract.vendorCategory})`} />
      </div>

      {/* 고객 정보 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">고객 정보</h3>
        <Row label="동호수" value={contract.unitNumber} />
        <Row label="고객명" value={contract.customerName} />
        <Row label="연락처" value={contract.customerPhone || '-'} />
      </div>

      {/* 계약 내용 (전자계약서) */}
      {contract.type === 'electronic' && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">계약 품목</h3>

          {contract.items.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-400 pb-1 border-b border-gray-100">
                <span className="col-span-2">품목</span>
                <span className="text-center">수량</span>
                <span className="text-right">금액</span>
              </div>
              {contract.items.map(item => (
                <div key={item.id} className="grid grid-cols-4 gap-2 text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="col-span-2 text-gray-700">{item.description || '(항목 없음)'}</span>
                  <span className="text-center text-gray-500">{item.quantity}개</span>
                  <span className="text-right font-medium text-gray-800">{item.amount.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">품목 없음</p>
          )}

          {/* 금액 요약 */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">합계금액</span>
              <span className="font-bold text-gray-800">{contract.totalAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">계약금</span>
              <span className="text-gray-700">{contract.depositAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-gray-500 font-semibold">잔금</span>
              <span className="font-bold text-gray-800">{balance.toLocaleString()}원</span>
            </div>
            {contract.paymentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">결제방법</span>
                <span className="text-gray-700">{contract.paymentMethod}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 서명 */}
      {(contract.customerSignature || contract.vendorSignature) && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">서명</h3>
          <div className="grid grid-cols-2 gap-4">
            {contract.customerSignature && (
              <div>
                <p className="text-xs text-gray-400 mb-2 text-center">고객 서명</p>
                <img
                  src={contract.customerSignature}
                  alt="고객서명"
                  className="w-full border border-gray-100 rounded-xl bg-gray-50"
                />
              </div>
            )}
            {contract.vendorSignature && (
              <div>
                <p className="text-xs text-gray-400 mb-2 text-center">업체 서명</p>
                <img
                  src={contract.vendorSignature}
                  alt="업체서명"
                  className="w-full border border-gray-100 rounded-xl bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 업로드 이미지 */}
      {contract.type === 'upload' && (contract.uploadedImages?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">계약서 이미지</h3>
          <div className="grid grid-cols-2 gap-3">
            {contract.uploadedImages!.map((img, i) => (
              <img key={i} src={img} alt={`계약서 ${i + 1}`}
                className="w-full border border-gray-100 rounded-xl object-cover aspect-[3/4]" />
            ))}
          </div>
        </div>
      )}

      {/* 메모 */}
      {contract.notes && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-700 text-sm border-b pb-2 mb-3">메모</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.notes}</p>
        </div>
      )}

      <button
        onClick={() => navigate(`/vendor/contracts/${id}/edit`)}
        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90"
        style={{ backgroundColor: '#667EEA' }}
      >
        <Pencil size={16} /> 수정하기
      </button>
    </div>
  );
}
