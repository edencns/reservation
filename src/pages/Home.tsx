import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, Text, Button, Group, Paper, Grid, RingProgress
} from '@mantine/core';
import {
  IconChevronRight, IconTicket,
} from '@tabler/icons-react';
import { useApp } from '../context/AppContext';
import { isAdminLoggedIn } from '../utils/storage';

export default function Home() {
  const navigate = useNavigate();
  const { reservations, companyInfo } = useApp();
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  useEffect(() => {
    const onAuth = () => setLoggedIn(isAdminLoggedIn());
    window.addEventListener('rv_auth_change', onAuth);
    return () => window.removeEventListener('rv_auth_change', onAuth);
  }, []);

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
            아파트 입주박람회, <span style={{ color: '#d6c4f4'}}>스마트</span> 예약 시스템
          </Title>
          <Text size="lg" style={{ color: '#e0d6f9', marginBottom: '2rem' }}>
            방문객 예약부터 현장 체크인까지, 모든 과정을 간편하게 관리하고 성공적인 입주 박람회를 개최하세요.
          </Text>
          <Group justify="center">
            <Button
              size="lg"
              radius="xl"
              onClick={() => navigate('/events')}
              rightSection={<IconChevronRight size={20} />}
              variant="white"
              color="#667eea"
            >
              박람회 목록 보기
            </Button>
            <Button
              size="lg"
              radius="xl"
              onClick={() => navigate('/my-tickets')}
              variant="outline"
              color="white"
            >
              내 예약 확인
            </Button>
          </Group>
        </Container>
      </Paper>

      <Container size="lg" style={{ padding: '2rem 1rem' }}>
        <Grid gutter="xl">
          {/* ── Today's Summary ── */}
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

        {/* ── Company Info ── */}
        <Paper mt="xl" p="xl" radius="lg" withBorder>
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Group>
                <IconTicket size={32} color="#667eea" />
                <Title order={3} style={{ color: '#667eea' }}>ReserveTicket</Title>
              </Group>
              <Text mt="sm" c="dimmed">성공적인 입주 박람회를 위한 최고의 선택, ReserveTicket과 함께하세요.</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Text fw={700} mb="sm">회사정보</Text>
              <Text>{companyInfo.name || '회사명 미입력'}</Text>
              <Text>{companyInfo.address || '회사 주소 미입력'}</Text>
              <Text>{companyInfo.email || '회사 이메일 미입력'}</Text>
            </Grid.Col>
          </Grid>
          <Text ta="center" c="dimmed" mt="xl" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>© 2026 ReserveTicket. All rights reserved.</Text>
        </Paper>
      </Container>

    </div>
  );
}
