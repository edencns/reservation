import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Title, Text, Button, Group, Modal, TextInput, Paper, Grid, RingProgress, ThemeIcon
} from '@mantine/core';
import {
  IconChevronRight, IconTicket, IconFileText,
  IconQrcode, IconCheck, IconX, IconLock,
} from '@tabler/icons-react';
import { useApp } from '../context/AppContext';
import { isAdminLoggedIn } from '../utils/storage';
import { formatDate } from '../utils/helpers';
import type { Reservation } from '../types';

type LookupResult = Reservation | 'not-found' | null;

export default function Home() {
  const navigate = useNavigate();
  const { reservations, checkIn, companyInfo } = useApp();
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  useEffect(() => {
    const onAuth = () => setLoggedIn(isAdminLoggedIn());
    window.addEventListener('rv_auth_change', onAuth);
    return () => window.removeEventListener('rv_auth_change', onAuth);
  }, []);

  const [qrOpen, setQrOpen] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayRsvs = reservations.filter(r => r.date === today && r.status === 'confirmed');
  const checkedInCount = todayRsvs.filter(r => r.checkedIn).length;
  const totalVisitors = todayRsvs.reduce((s, r) => s + r.attendeeCount, 0);
  const checkedInVisitors = todayRsvs.filter(r => r.checkedIn).reduce((s, r) => s + r.attendeeCount, 0);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const id = lookupId.trim().toLowerCase();
    const found = reservations.find(r =>
      r.id.toLowerCase() === id || r.id.toLowerCase().startsWith(id)
    );
    setLookupResult(found ?? 'not-found');
  };

  const handleCheckIn = (id: string) => {
    checkIn(id);
    setLookupResult(prev =>
      prev && prev !== 'not-found' && prev.id === id
        ? { ...prev, checkedIn: true, checkedInAt: new Date().toISOString() }
        : prev
    );
    setLookupId('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeQr = () => {
    setQrOpen(false);
    setLookupId('');
    setLookupResult(null);
  };

  const getName = (r: Reservation) =>
    r.customer.name || r.extraFields['name'] || '(이름 없음)';

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
          {/* ── Quick Actions ── */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper
              withBorder
              radius="lg"
              p="xl"
              onClick={() => setQrOpen(true)}
              style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              <Group align="center">
                <ThemeIcon size="xl" radius="lg" color="grape">
                  <IconQrcode size={28} />
                </ThemeIcon>
                <div>
                  <Text size="xl" fw={700}>QR 체크인</Text>
                  <Text size="sm" c="dimmed">방문객 QR코드를 스캔하여 체크인</Text>
                </div>
              </Group>
            </Paper>
          </Grid.Col>

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
              <Text><IconFileText size={14} /> {companyInfo.name || '회사명 미입력'}</Text>
              <Text><IconFileText size={14} /> {companyInfo.address || '회사 주소 미입력'}</Text>
              <Text><IconFileText size={14} /> {companyInfo.email || '회사 이메일 미입력'}</Text>
            </Grid.Col>
          </Grid>
          <Text ta="center" c="dimmed" mt="xl" pt="md" style={{ borderTop: '1px solid #e9ecef' }}>© 2026 ReserveTicket. All rights reserved.</Text>
        </Paper>
      </Container>

      {/* ── QR Modal ── */}
      <Modal opened={qrOpen} onClose={closeQr} title="QR 체크인" centered>
        {!loggedIn ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <IconLock size={48} style={{ margin: '0 auto', color: '#ced4da' }} />
            <Text size="lg" fw={700} mt="md">관리자 로그인이 필요합니다</Text>
            <Text c="dimmed" mb="xl">이 기능은 관리자만 사용할 수 있습니다</Text>
            <Group grow>
              <Button variant="default" onClick={closeQr}>닫기</Button>
              <Button onClick={() => navigate('/admin')} color="grape">로그인하기</Button>
            </Group>
          </div>
        ) : (
          <>
            <form onSubmit={handleLookup}>
              <Group>
                <TextInput
                  ref={inputRef}
                  placeholder="예약 번호 입력 또는 QR 스캔"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.currentTarget.value)}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <Button type="submit" color="grape">조회</Button>
              </Group>
            </form>

            {lookupResult && (
              <Paper withBorder p="md" mt="md" radius="md" bg={
                lookupResult === 'not-found'
                  ? 'red.0'
                  : lookupResult.checkedIn
                    ? 'teal.0'
                    : lookupResult.status === 'cancelled'
                      ? 'gray.1'
                      : 'grape.0'
              }>
                {lookupResult === 'not-found' ? (
                  <Group>
                    <IconX color="red" />
                    <Text c="red" fw={700}>예약을 찾을 수 없습니다</Text>
                  </Group>
                ) : (
                  <>
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" c={lookupResult.checkedIn ? 'teal' : 'grape'} fw={700}>
                                {lookupResult.checkedIn ? '입장완료' : lookupResult.status === 'cancelled' ? '취소된 예약' : '예약확정'}
                            </Text>
                            <Text fw={700}>{lookupResult.eventTitle}</Text>
                            <Text size="sm" c="dimmed">{formatDate(lookupResult.date)} · {lookupResult.time}</Text>
                            <Text size="sm" mt="xs">{getName(lookupResult)}</Text>
                        </div>
                        {!lookupResult.checkedIn && lookupResult.status === 'confirmed' && (
                        <Button color="teal" onClick={() => handleCheckIn(lookupResult.id)}><IconCheck size={16}/>&nbsp; 입장 처리</Button>
                        )}
                    </Group>
                  </>
                )}
              </Paper>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
