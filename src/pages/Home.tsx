import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, Text, Button, Group, Paper, Grid, RingProgress, Modal
} from '@mantine/core';
import { IconChevronRight, IconTicket, IconChevronLeft } from '@tabler/icons-react';
import { useApp } from '../context/AppContext';
import { isAdminLoggedIn } from '../utils/storage';
import { formatDate } from '../utils/helpers';

const TERMS_CONTENT = `제1조 (목적)
본 약관은 ReserveTicket(이하 "회사")이 제공하는 입주박람회 예약 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (서비스 이용)
① 서비스는 박람회 방문 예약, 예약 확인 및 관련 안내를 제공합니다.
② 이용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.
③ 회사는 서비스의 내용을 사전 공지 후 변경할 수 있습니다.

제3조 (이용자의 의무)
① 이용자는 예약 시 정확한 정보를 입력하여야 합니다.
② 타인의 정보를 도용하거나 허위 정보를 입력하는 행위는 금지됩니다.
③ 서비스를 통해 획득한 정보를 회사의 동의 없이 상업적으로 이용할 수 없습니다.

제4조 (서비스 제공의 제한)
회사는 다음 각 호의 경우 서비스 제공을 제한하거나 중단할 수 있습니다.
① 시스템 점검, 교체 및 고장 등의 부득이한 경우
② 전기통신사업법에 규정된 기간통신사업자가 서비스를 중단한 경우

제5조 (면책조항)
① 회사는 천재지변, 전쟁, 기타 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.
② 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 회사는 책임지지 않습니다.

제6조 (분쟁 해결)
본 약관과 관련한 분쟁은 대한민국 법률을 적용하며, 분쟁 발생 시 관할 법원은 민사소송법에 따릅니다.`;

const PRIVACY_CONTENT = `개인정보 수집·이용 목적
ReserveTicket은 박람회 방문 예약 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.

■ 수집 항목
• 필수: 이름, 휴대폰 번호, 동호수
• 선택: 이메일 주소

■ 수집·이용 목적
• 방문 예약 접수 및 확인
• 예약 안내 문자(SMS) 발송
• 현장 입장 확인

■ 보유·이용 기간
행사 종료 후 1개월 이내 파기

■ 개인정보 제3자 제공
회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 이용자의 동의가 있거나 법령에 의한 경우는 예외로 합니다.

■ 개인정보 처리 위탁
회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁할 수 있습니다.
• 수탁자: SMS 발송 대행사 / 위탁 업무: 문자메시지 발송

■ 정보주체의 권리
이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.
문의: 서비스 내 회사 이메일로 요청하시기 바랍니다.

■ 개인정보 보호책임자
본 서비스의 개인정보 처리에 관한 문의는 회사 이메일로 연락하여 주시기 바랍니다.`;

export default function Home() {
  const navigate = useNavigate();
  const { events, reservations, companyInfo } = useApp();
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onAuth = () => setLoggedIn(isAdminLoggedIn());
    window.addEventListener('rv_auth_change', onAuth);
    return () => window.removeEventListener('rv_auth_change', onAuth);
  }, []);

  const activeEvents = events.filter(e => e.status === 'active');

  // Auto-slide
  useEffect(() => {
    if (activeEvents.length <= 1) return;
    timerRef.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % activeEvents.length);
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeEvents.length]);

  const goSlide = (dir: 1 | -1) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSlideIdx(i => (i + dir + activeEvents.length) % activeEvents.length);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRsvs = reservations.filter(r => r.date === today && r.status === 'confirmed');
  const checkedInCount = todayRsvs.filter(r => r.checkedIn).length;
  const totalVisitors = todayRsvs.reduce((s, r) => s + r.attendeeCount, 0);
  const checkedInVisitors = todayRsvs.filter(r => r.checkedIn).reduce((s, r) => s + r.attendeeCount, 0);

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: 'calc(100dvh - 4rem)' }}>

      {/* ── Hero ── */}
      <Paper
        radius={0}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '60px 20px',
        }}
      >
        <Container size="lg" style={{ textAlign: 'center' }}>
          <Title order={1} style={{ color: 'white', fontSize: '3rem', marginBottom: '1rem' }}>
            아파트 입주박람회, <span style={{ color: '#d6c4f4' }}>스마트</span> 예약 시스템
          </Title>
          <Text size="lg" style={{ color: '#e0d6f9' }}>
            방문객 예약부터 현장 체크인까지, 모든 과정을 간편하게 관리하고 성공적인 입주 박람회를 개최하세요.
          </Text>
        </Container>
      </Paper>

      <Container size="lg" style={{ padding: '2rem 1rem' }}>

        {/* ── 진행 중인 박람회 슬라이드 ── */}
        {activeEvents.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text fw={700} size="lg" style={{ color: '#444' }}>
                현재 진행 중인 박람회
              </Text>
              <button
                onClick={() => navigate('/events')}
                style={{
                  background: 'none', border: '1px solid #667eea', borderRadius: '999px',
                  padding: '5px 14px', cursor: 'pointer', color: '#667eea',
                  fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px',
                }}
              >
                목록 보기 <IconChevronRight size={13} />
              </button>
            </div>
            {/* 페이드 슬라이드 컨테이너 */}
            <div style={{ position: 'relative', borderRadius: '1rem', overflow: 'hidden', minHeight: '220px' }}>
              {activeEvents.map((ev, i) => {
                const startDate = ev.dates[0] ?? '';
                const endDate = ev.dates[ev.dates.length - 1] ?? '';
                const dateLabel = startDate === endDate
                  ? formatDate(startDate)
                  : `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
                return (
                  <div
                    key={ev.id}
                    style={{
                      position: 'absolute', inset: 0,
                      opacity: i === slideIdx ? 1 : 0,
                      transition: 'opacity 1.2s ease',
                      cursor: 'pointer',
                      pointerEvents: i === slideIdx ? 'auto' : 'none',
                    }}
                    onClick={() => navigate(`/e/${ev.slug}`)}
                  >
                    {/* 배너 이미지 or 그라디언트 */}
                    {ev.imageUrl
                      ? <img src={ev.imageUrl} alt={ev.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
                    }
                    {/* 오버레이 */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: ev.imageUrl
                        ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)'
                        : 'rgba(0,0,0,0.12)',
                    }} />
                    {/* 텍스트: 카드 중앙 배치, 좌측 정렬 */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '100%', maxWidth: '540px',
                        padding: '32px 28px',
                        display: 'flex', flexDirection: 'column', gap: '8px',
                      }}>
                        <div style={{
                          alignSelf: 'flex-start',
                          background: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '999px',
                          padding: '3px 14px',
                          fontSize: '12px', fontWeight: 700, color: 'white',
                        }}>진행 중</div>
                        <Title order={3} style={{ color: 'white', margin: 0, textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                          {ev.title}
                        </Title>
                        <Text size="sm" style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                          {ev.venue}
                        </Text>
                        {ev.address && (
                          <Text size="xs" style={{ color: 'rgba(255,255,255,0.78)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                            {ev.address}
                          </Text>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <Text size="sm" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                            {dateLabel}
                          </Text>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                            padding: '6px 14px', borderRadius: '999px',
                            fontSize: '13px', fontWeight: 700, color: 'white',
                          }}>
                            예약하기 <IconChevronRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Prev / Next 버튼 */}
              {activeEvents.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); goSlide(-1); }} style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                  }}>
                    <IconChevronLeft size={18} color="white" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); goSlide(1); }} style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                  }}>
                    <IconChevronRight size={18} color="white" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {activeEvents.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: '6px', zIndex: 10,
                }}>
                  {activeEvents.map((_, i) => (
                    <button key={i} onClick={e => { e.stopPropagation(); setSlideIdx(i); }} style={{
                      width: i === slideIdx ? '20px' : '8px', height: '8px',
                      borderRadius: '999px',
                      background: i === slideIdx ? 'white' : 'rgba(255,255,255,0.5)',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.3s', padding: 0,
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Today's Summary ── */}
        <Grid gutter="xl">
          {loggedIn && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder radius="lg" p="xl" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Text size="lg" fw={700} mb="md">오늘의 방문 현황</Text>
                <Grid>
                  <Grid.Col span={6}>
                    <RingProgress
                      sections={[{ value: (checkedInCount / (todayRsvs.length || 1)) * 100, color: 'teal' }]}
                      label={
                        <Text c="teal" fw={700} ta="center" size="xl">
                          {`${Math.round((checkedInCount / (todayRsvs.length || 1)) * 100)}%`}
                        </Text>
                      }
                    />
                    <Text ta="center" mt="sm">입장율 ({checkedInCount}/{todayRsvs.length})</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text c="dimmed">총 방문객</Text>
                    <Text size="xl" fw={700}>{totalVisitors}명</Text>
                    <Text c="dimmed" mt="sm">입장 완료 방문객</Text>
                    <Text size="xl" c="teal" fw={700}>{checkedInVisitors}명</Text>
                  </Grid.Col>
                </Grid>
              </Paper>
            </Grid.Col>
          )}
        </Grid>

        {/* ── Footer / Company Info ── */}
        <Paper mt="xl" p="xl" radius="lg" withBorder>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group>
                <IconTicket size={32} color="#667eea" />
                <Title order={3} style={{ color: '#667eea' }}>ReserveTicket</Title>
              </Group>
              <Text mt="sm" c="dimmed">성공적인 입주 박람회를 위한 최고의 선택, ReserveTicket과 함께하세요.</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text fw={700} mb="sm">회사정보</Text>
              <Text>{companyInfo.name || '회사명 미입력'}</Text>
              <Text>{companyInfo.address || '회사 주소 미입력'}</Text>
              <Text>{companyInfo.email || '회사 이메일 미입력'}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Text fw={700} mb="sm">법적 고지</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => setModalContent({ title: '이용약관', body: TERMS_CONTENT })}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: '#667eea', fontSize: '14px', textDecoration: 'underline' }}
                >
                  이용약관
                </button>
                <button
                  onClick={() => setModalContent({ title: '개인정보처리방침', body: PRIVACY_CONTENT })}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: '#667eea', fontSize: '14px', textDecoration: 'underline' }}
                >
                  개인정보처리방침
                </button>
              </div>
            </Grid.Col>
          </Grid>
          <Text ta="center" c="dimmed" mt="xl" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>
            © 2026 ReserveTicket. All rights reserved.
          </Text>
        </Paper>
      </Container>

      {/* ── 법적 고지 팝업 ── */}
      <Modal
        opened={!!modalContent}
        onClose={() => setModalContent(null)}
        title={<span style={{ fontWeight: 700, fontSize: '16px' }}>{modalContent?.title}</span>}
        size="lg"
        centered
      >
        <Text
          size="sm"
          c="dimmed"
          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
        >
          {modalContent?.body}
        </Text>
        <Button
          fullWidth
          mt="xl"
          onClick={() => setModalContent(null)}
          style={{ backgroundColor: '#667eea' }}
        >
          확인
        </Button>
      </Modal>

    </div>
  );
}
