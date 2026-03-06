export type ReservationStatus = 'confirmed' | 'cancelled';
export type CustomFieldType = 'text' | 'tel' | 'number' | 'email' | 'select' | 'multiselect';

export interface CustomField {
  id: string;
  key: string;         // 저장 키 (영문, 예: 'unitNumber')
  label: string;       // 표시 레이블 (예: '동호수')
  type: CustomFieldType;
  placeholder?: string;
  options?: string[];  // type='select'일 때 선택지
  required: boolean;
}

export interface TimeSlotDef {
  id: string;
  time: string;
}

export interface Event {
  id: string;
  slug: string;                  // 고유 URL 슬러그 (예: 'abc123de')
  shareDomain?: string;          // 행사별 공유 도메인 (예: 'https://example.com')
  imageUrl?: string;             // 행사 배너 이미지 URL
  title: string;
  description: string;
  venue: string;
  address: string;
  dates: string[];
  startTime?: string;
  endTime?: string;
  timeSlots: TimeSlotDef[];
  customFields: CustomField[];   // 행사별 커스텀 수집 필드
  vendorCategories?: VendorCategory[];
  vendors?: Vendor[];
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
}

export interface Reservation {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  timeSlotId: string;
  attendeeCount: number;
  customer: Customer;
  extraFields: Record<string, string>;  // 커스텀 필드 값 (key → value)
  status: ReservationStatus;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
}

export interface VendorDocument {
  id: string;
  name: string;     // 서류 이름 (예: "사업자등록증")
  imageUrl: string;
}

export interface ManagedVendor {
  id: string;
  name: string;              // 상호
  phone: string;             // 전화번호
  email: string;             // 이메일
  category: string;          // 카테고리
  businessType?: string;     // 구버전 호환 (deprecated)
  products: string;          // 취급상품
  representativeName: string;// 대표자 이름
  address: string;           // 주소
  contactName: string;       // 담당자 이름
  contactPhone: string;      // 담당자 번호
  notes: string;             // 비고
  imageUrl?: string;         // 업체 대표 이미지
  documents: VendorDocument[];
  loginId?: string;          // 업체 포털 로그인 ID
  loginPassword?: string;    // 업체 포털 비밀번호
  createdAt: string;
}

export interface ContractItem {
  id: string;
  description: string;   // 품목/서비스명
  quantity: number;
  unitPrice: number;
  amount: number;        // quantity × unitPrice
}

export type ContractType = 'electronic' | 'upload' | 'template';
export type ContractStatus = 'draft' | 'completed';

export interface TemplateField {
  id: string;
  pageIndex: number;
  x: number;       // % from left
  y: number;       // % from top
  type: 'text' | 'signature';
  value: string;   // text content or base64 signature
}

export interface VendorContract {
  id: string;
  vendorId: string;        // ManagedVendor.id
  vendorName: string;
  vendorCategory: string;
  eventId: string;
  eventTitle: string;
  // 계약 상대방
  unitNumber: string;      // 동호수
  customerName: string;
  customerPhone: string;
  // 계약 내용
  items: ContractItem[];
  totalAmount: number;
  depositAmount: number;
  paymentMethod: string;
  notes: string;
  contractDate: string;
  // 전자서명
  customerSignature?: string;  // base64 canvas
  vendorSignature?: string;
  // 파일 업로드
  uploadedImages?: string[];   // base64 image array
  // 내 양식 계약서 필드
  templateFields?: TemplateField[];
  type: ContractType;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCategory {
  id: string;
  name: string; // 예: "가구", "방충망", "입주청소"
}

export interface Vendor {
  id: string;
  categoryId: string;
  name: string;
  imageUrl?: string;
  managedVendorId?: string;  // 관리 업체 참조 ID
}

export interface CompanyInfo {
  name: string;
  address: string;
  email: string;
}
