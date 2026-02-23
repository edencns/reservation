import type { Event } from '../types';
import { generateId } from './helpers';

const today = new Date('2026-02-23');
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

export const SEED_EVENTS: Event[] = [
  {
    id: generateId(),
    title: '뮤지컬 "사랑의 콰르텟"',
    description:
      '사랑과 우정, 배신 사이에서 갈등하는 네 남녀의 이야기를 담은 감동적인 뮤지컬. 국내 최정상 뮤지컬 배우들이 출연하며 화려한 무대 연출과 감미로운 음악으로 관객들을 사로잡습니다.',
    venue: '블루스퀘어 마스터카드홀',
    address: '서울특별시 용산구 이태원로 294',
    category: 'performance',
    dates: dateRange(5, 35),
    timeSlots: [
      { id: 't1', time: '14:00', maxCapacity: 150 },
      { id: 't2', time: '19:00', maxCapacity: 150 },
    ],
    seatType: 'numbered',
    rows: 10,
    seatsPerRow: 15,
    maxCapacity: 150,
    pricing: [
      { category: 'VIP석', price: 130000, color: '#FFD700', rows: ['A', 'B'] },
      { category: 'R석', price: 110000, color: '#FF6B6B', rows: ['C', 'D'] },
      { category: 'S석', price: 90000, color: '#91ADC2', rows: ['E', 'F', 'G'] },
      { category: 'A석', price: 70000, color: '#95D5B2', rows: ['H', 'I', 'J'] },
    ],
    runningTime: '2시간 30분 (인터미션 20분 포함)',
    ageLimit: '만 7세 이상',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: '한국 현대 미술전 "빛과 그림자"',
    description:
      '국내외 현대 미술 작가 50인의 회화, 조각, 미디어아트 등 200여 점을 한자리에서 만나볼 수 있는 대규모 기획전. 빛과 그림자를 주제로 삶의 이면을 탐구합니다.',
    venue: '국립현대미술관 서울관',
    address: '서울특별시 종로구 삼청로 30',
    category: 'exhibition',
    dates: dateRange(1, 45),
    timeSlots: [
      { id: 't1', time: '10:00', maxCapacity: 50 },
      { id: 't2', time: '12:00', maxCapacity: 50 },
      { id: 't3', time: '14:00', maxCapacity: 50 },
      { id: 't4', time: '16:00', maxCapacity: 50 },
    ],
    seatType: 'unnumbered',
    rows: 0,
    seatsPerRow: 0,
    maxCapacity: 50,
    pricing: [
      { category: '성인', price: 15000, color: '#91ADC2' },
      { category: '청소년', price: 8000, color: '#95D5B2' },
      { category: '어린이', price: 5000, color: '#FFDAB9' },
    ],
    runningTime: '자유 관람',
    ageLimit: '전체 이용가',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: '봄 페스티벌 음악회 2026',
    description:
      '봄의 시작을 알리는 야외 클래식·팝 음악회. 국내 유명 오케스트라와 솔리스트들이 함께하는 특별한 밤. 가족, 연인과 함께 아름다운 봄밤의 음악을 즐겨보세요.',
    venue: '올림픽공원 88잔디마당',
    address: '서울특별시 송파구 올림픽로 424',
    category: 'concert',
    dates: [d(14), d(15)],
    timeSlots: [
      { id: 't1', time: '18:00', maxCapacity: 500 },
    ],
    seatType: 'unnumbered',
    rows: 0,
    seatsPerRow: 0,
    maxCapacity: 500,
    pricing: [
      { category: 'VIP', price: 100000, color: '#FFD700' },
      { category: '일반', price: 50000, color: '#91ADC2' },
    ],
    runningTime: '2시간',
    ageLimit: '전체 이용가',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    title: 'IT 미래 컨퍼런스 2026',
    description:
      'AI, 메타버스, 블록체인 등 최신 IT 트렌드를 선도하는 전문가들이 한자리에 모입니다. 다양한 세션과 네트워킹을 통해 미래 기술의 방향을 함께 탐색하세요.',
    venue: 'COEX 그랜드볼룸',
    address: '서울특별시 강남구 영동대로 513',
    category: 'conference',
    dates: [d(7), d(8)],
    timeSlots: [
      { id: 't1', time: '09:00', maxCapacity: 300 },
    ],
    seatType: 'numbered',
    rows: 15,
    seatsPerRow: 20,
    maxCapacity: 300,
    pricing: [
      { category: '일반', price: 200000, color: '#91ADC2', rows: ['A','B','C','D','E','F','G','H'] },
      { category: '학생', price: 50000, color: '#95D5B2', rows: ['I','J','K','L','M','N','O'] },
    ],
    runningTime: '1일 (09:00~18:00)',
    ageLimit: '전체 이용가',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];
