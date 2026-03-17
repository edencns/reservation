import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from '@mantine/carousel';
import { RingProgress, Modal, Center, Title } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';

const TERMS_CONTENT = `제1조 (목적)
본 약관은 ReserveTicket(이하 "회사")이 제공하는 입주박람회 예약 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다. ... (이하 생략)`;

const PRIVACY_CONTENT = `개인정보 수집·이용 목적
ReserveTicket은 박람회 방문 예약 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다. ... (이하 생략)`;

export default function Home() {
  const navigate = useNavigate();
  const { events, reservations, companyInfo } = useApp();
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const activeEvents = events.filter(e => e.status === 'active');

  const today = new Date().toISOString().split('T')[0];
  const todayRsvs = reservations.filter(r => r.date === today && r.status === 'confirmed');
  const checkedInCount = todayRsvs.filter(r => r.checkedIn).length;
  const totalVisitors = todayRsvs.reduce((s, r) => s + r.attendeeCount, 0);
  const checkedInVisitors = todayRsvs.filter(r => r.checkedIn).reduce((s, r) => s + r.attendeeCount, 0);
  const admissionRate = Math.round((checkedInCount / (todayRsvs.length || 1)) * 100);

  return (
    <div style={{ background: 'linear-gradient(to bottom, #E0F2FE, #FDF6E8)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div className="py-20 md:py-28 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: '#1E3A8A' }}>
          아파트 입주박람회,<br className="sm:hidden" /> 스마트 예약 시스템
        </h1>
        <p className="text-sm sm:text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: '#475569' }}>
          방문객 예약부터 현장 체크인까지, 모든 과정을 간편하게 관리하고 성공적인 입주 박람회를 개최하세요.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => navigate('/events')}
            className="px-8 py-3 rounded-full text-white font-bold text-base shadow-md hover:opacity-90 transition-opacity"
            style={{ background: '#3B82F6' }}
          >
            예약하기
          </button>
          <button
            onClick={() => navigate('/my-tickets')}
            className="px-8 py-3 rounded-full font-bold text-base border-2 bg-white hover:bg-blue-50 transition-colors"
            style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
          >
            내 예약 확인
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* 현재 진행 중인 박람회 */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#1E3A8A' }}>현재 진행 중인 박람회</h2>
              {activeEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">🏢</p>
                  <p className="font-medium">진행 중인 박람회가 없습니다</p>
                </div>
              ) : (
                <Carousel
                  slideSize="100%"
                  emblaOptions={{ align: 'start', loop: activeEvents.length > 1 }}
                  withControls={activeEvents.length > 1}
                  withIndicators={activeEvents.length > 1}
                  previousControlIcon={<ChevronLeft size={32} strokeWidth={2.5} color="#3B82F6" />}
                  nextControlIcon={<ChevronRight size={32} strokeWidth={2.5} color="#3B82F6" />}
                  classNames={{ indicators: 'carousel-indicators' }}
                  styles={{
                    control: {
                      background: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      width: 44,
                      height: 44,
                    },
                    controls: { padding: '0' },
                    root: { paddingBottom: activeEvents.length > 1 ? '2.5rem' : '0' },
                    indicators: { bottom: '0' },
                  }}
                >
                  {activeEvents.map(event => (
                    <Carousel.Slide key={event.id}>
                      <EventCard event={event} plain />
                    </Carousel.Slide>
                  ))}
                </Carousel>
              )}
            </div>
          </div>

          {/* 오늘의 방문 현황 */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-center mb-6" style={{ color: '#1E3A8A' }}>오늘의 방문 현황</h2>
              <Center>
                <RingProgress
                  size={180}
                  thickness={14}
                  sections={[{ value: admissionRate, color: '#3B82F6' }]}
                  label={
                    <Center>
                      <Title order={2} style={{ fontSize: '2.5rem', color: '#1E3A8A' }}>{admissionRate}%</Title>
                    </Center>
                  }
                />
              </Center>
              <p className="text-center text-sm text-gray-400 mt-2">
                입장율 ({checkedInCount}/{todayRsvs.length})
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400">총 방문객</p>
                  <p className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>{totalVisitors}명</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">입장 완료 방문객</p>
                  <p className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>{checkedInVisitors}명</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">ReserveTicket</h3>
              <p className="text-sm text-gray-500">성공적인 입주 박람회를 위한 최고의 선택, ReserveTicket과 함께하세요.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">회사정보</h4>
              <p className="text-sm text-gray-500">{companyInfo.name || '이든씨엔에스 주식회사'}</p>
              <p className="text-sm text-gray-500">{companyInfo.address || '경기도 수원시 영통구 중부대로462번길 41-4'}</p>
              <p className="text-sm text-gray-500">{companyInfo.email || 'edencns1999@naver.com'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">법적 고지</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setModalContent({ title: '이용약관', body: TERMS_CONTENT })}
                  className="block text-sm text-gray-500 hover:text-gray-700"
                >
                  이용약관
                </button>
                <button
                  onClick={() => setModalContent({ title: '개인정보처리방침', body: PRIVACY_CONTENT })}
                  className="block text-sm text-gray-500 hover:text-gray-700"
                >
                  개인정보처리방침
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-8 pt-8 border-t border-gray-100">
            © {new Date().getFullYear()} ReserveTicket. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Modal ── */}
      <Modal
        opened={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.title}
        size="lg"
        centered
      >
        <p className="text-sm text-gray-500 whitespace-pre-wrap">{modalContent?.body}</p>
        <button
          onClick={() => setModalContent(null)}
          className="w-full mt-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          style={{ background: '#3B82F6' }}
        >
          확인
        </button>
      </Modal>
    </div>
  );
}
