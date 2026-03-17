import type { Event, CustomField } from '../types';
import { generateId } from './helpers';

const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split('T')[0];
};
const dateRange = (start: number, end: number) => {
  const dates: string[] = [];
  for (let i = start; i <= end; i++) dates.push(d(i));
  return dates;
};

const baseFields: CustomField[] = [
  { id: 'bf1', key: 'name', label: '이름', type: 'text', placeholder: '홍길동', required: true },
  { id: 'bf2', key: 'phone', label: '연락처', type: 'tel', placeholder: '01012345678', required: true },
  { id: 'bf3', key: 'unitNumber', label: '동호수', type: 'text', placeholder: '예) 101동 501호', required: true },
  { id: 'bf4', key: 'email', label: '이메일', type: 'email', placeholder: 'example@email.com', required: false },
];

export const SEED_EVENTS: Event[] = [
  {
    id: generateId(),
    slug: 'xi-thepark',
    title: '자이 더 파크 모델하우스 관람',
    description:
      '자이 더 파크 신규 분양 모델하우스 관람 예약입니다.\n84㎡ ~ 134㎡ 다양한 평형의 모델하우스를 직접 체험하실 수 있습니다.',
    venue: '자이 더 파크 모델하우스',
    address: '경기도 수원시 영통구 광교중앙로 182',
    dates: dateRange(0, 15),
    timeSlots: [
      { id: 't1', time: '10:00' },
      { id: 't2', time: '11:00' },
      { id: 't3', time: '13:00' },
      { id: 't4', time: '14:00' },
      { id: 't5', time: '15:00' },
      { id: 't6', time: '16:00' },
    ],
    customFields: [
      ...baseFields,
      {
        id: 'cf1', key: 'visitType', label: '방문 유형', type: 'select',
        options: ['청약 예정자', '기존 고객', '일반 방문'],
        required: true,
      },
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
    imageUrl: 'https://i.imgur.com/gT6P2y3.png', // Provided image URL
  }
];
