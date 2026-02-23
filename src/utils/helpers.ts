export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

export const formatCurrency = (amount: number): string =>
  amount.toLocaleString('ko-KR') + '원';

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  return phone;
};

export const categoryLabel: Record<string, string> = {
  concert: '콘서트',
  exhibition: '전시',
  sports: '스포츠',
  performance: '공연',
  conference: '컨퍼런스',
  other: '기타',
};

export const paymentLabel: Record<string, string> = {
  card: '신용카드',
  bank: '무통장 입금',
  phone: '휴대폰 결제',
};

export const getRowLabel = (rowIndex: number): string =>
  String.fromCharCode(65 + rowIndex); // A, B, C...

export const getSeatId = (row: number, seat: number): string =>
  `${getRowLabel(row)}-${seat}`;

export const getSeatPriceCategory = (
  rowIndex: number,
  pricing: { category: string; price: number; color: string; rows?: string[] }[]
): { category: string; price: number; color: string } => {
  const rowLabel = getRowLabel(rowIndex);
  for (const p of pricing) {
    if (p.rows && p.rows.includes(rowLabel)) return p;
  }
  return pricing[pricing.length - 1] ?? { category: 'A석', price: 0, color: '#ccc' };
};
