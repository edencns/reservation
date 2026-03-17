import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, Text, Button, Group, Paper, Grid, RingProgress, Modal, Center, Box, Stack
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
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
    <Box style={{ background: 'linear-gradient(to bottom, #E0F2FE, #FDF6E8)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <Center style={{ paddingTop: '6rem', paddingBottom: '4rem', textAlign: 'center' }}>
        <Container>
          <Title order={1} style={{ fontSize: '2.5rem', color: '#1E3A8A', fontWeight: 900, marginBottom: '1rem' }}>
            아파트 입주박람회, 스마트 예약 시스템
          </Title>
          <Text size="lg" style={{ color: '#475569', marginBottom: '2rem' }}>
            방문객 예약부터 현장 체크인까지, 모든 과정을 간편하게 관리하고<br />성공적인 입주 박람회를 개최하세요.
          </Text>
          <Group justify="center">
            <Button size="lg" radius="xl" onClick={() => navigate('/events')} style={{ background: '#3B82F6' }}>
              예약하기
            </Button>
            <Button variant="outline" size="lg" radius="xl" onClick={() => navigate('/my-tickets')} style={{ borderColor: '#3B82F6', color: '#3B82F6' }}>
              내 예약 확인
            </Button>
          </Group>
        </Container>
      </Center>

      <Container size="lg" style={{ paddingBottom: '4rem' }}>
        <Grid gutter="xl" align="flex-start">
          {/* ── 진행 중인 박람회 ── */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Text size="xl" fw={700} mb="lg" style={{ color: '#1E3A8A' }}>
              현재 진행 중인 박람회
            </Text>
            <Carousel
              slideSize="100%"
              emblaOptions={{ align: 'start', loop: true }}
              withControls
              withIndicators
              classNames={{ indicators: 'carousel-indicators' }}
              styles={{
                control: {
                  background: '#3B82F6',
                  border: 'none',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                },
              }}
            >
              {activeEvents.map(event => (
                <Carousel.Slide key={event.id}>
                  <EventCard event={event} />
                </Carousel.Slide>
              ))}
            </Carousel>
          </Grid.Col>

          {/* ── 오늘의 방문 현황 ── */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper radius="lg" shadow="md" p="xl">
              <Text size="xl" fw={700} ta="center" mb="xl" style={{ color: '#1E3A8A' }}>
                오늘의 방문 현황
              </Text>
              <Center>
                <RingProgress
                  size={180}
                  thickness={14}
                  sections={[{ value: admissionRate, color: '#3B82F6' }]}
                  label={
                    <Center>
                      <Title order={2} style={{ fontSize: '2.5rem', color: '#1E3A8A' }}>{`${admissionRate}%`}</Title>
                    </Center>
                  }
                />
              </Center>
              <Text ta="center" c="dimmed" mt="sm">입장율 ({checkedInCount}/{todayRsvs.length})</Text>

              <Grid mt="xl" grow>
                <Grid.Col span={6} style={{ textAlign: 'center' }}>
                  <Text c="dimmed">총 방문객</Text>
                  <Text size="2rem" fw={700} style={{ color: '#1E3A8A' }}>{totalVisitors}명</Text>
                </Grid.Col>
                <Grid.Col span={6} style={{ textAlign: 'center' }}>
                  <Text c="dimmed">입장 완료 방문객</Text>
                  <Text size="2rem" fw={700} style={{ color: '#1E3A8A' }}>{checkedInVisitors}명</Text>
                </Grid.Col>
              </Grid>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      {/* ── Footer ── */}
      <Box style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '3rem 0' }}>
        <Container size="lg">
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Title order={4} style={{ color: '#111827' }}>ReserveTicket</Title>
              <Text c="dimmed" mt="sm">
                성공적인 입주 박람회를 위한 최고의 선택, ReserveTicket과 함께하세요.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Title order={5} style={{ color: '#374151' }}>회사정보</Title>
              <Text c="dimmed" mt="sm">{companyInfo.name || '이든씨엔에스 주식회사'}</Text>
              <Text c="dimmed">{companyInfo.address || '경기도 수원시 영통구 중부대로462번길 41-4'}</Text>
              <Text c="dimmed">{companyInfo.email || 'edencns1999@naver.com'}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Title order={5} style={{ color: '#374151' }}>법적 고지</Title>
              <Stack gap="xs" mt="sm">
                 <a onClick={() => setModalContent({ title: '이용약관', body: TERMS_CONTENT })} style={{ cursor: 'pointer', color: '#6B7280', textDecoration:'none' }}>이용약관</a>
                 <a onClick={() => setModalContent({ title: '개인정보처리방침', body: PRIVACY_CONTENT })} style={{ cursor: 'pointer', color: '#6B7280', textDecoration:'none' }}>개인정보처리방침</a>
              </Stack>
            </Grid.Col>
          </Grid>
          <Text c="dimmed" ta="center" mt="xl" pt="xl" style={{ borderTop: '1px solid #E5E7EB' }}>
            © {new Date().getFullYear()} ReserveTicket. All rights reserved.
          </Text>
        </Container>
      </Box>

      <Modal opened={!!modalContent} onClose={() => setModalContent(null)} title={modalContent?.title} size="lg" centered>
        <Text style={{ whiteSpace: 'pre-wrap' }} c="dimmed" size="sm">{modalContent?.body}</Text>
        <Button fullWidth mt="xl" onClick={() => setModalContent(null)} style={{ background: '#3B82F6' }}>확인</Button>
      </Modal>
    </Box>
  );
}
