import { useNavigate } from 'react-router-dom';
import { Paper, Text, Button, AspectRatio } from '@mantine/core';
import type { Event } from '../types';
import { formatDate } from '../utils/helpers';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  const startDate = event.dates[0] ? formatDate(event.dates[0]) : '';
  const endDate = event.dates.length > 1 ? formatDate(event.dates[event.dates.length - 1]) : '';

  return (
    <Paper radius="lg" shadow="md" p="lg" withBorder>
      <AspectRatio ratio={16 / 9} mb="md">
        <img
          src={event.imageUrl || 'https://via.placeholder.com/400x225?text=Event+Image'}
          alt={event.title}
          style={{ borderRadius: '8px', objectFit: 'cover' }}
        />
      </AspectRatio>

      <Text fw={700} size="lg" mb="xs" truncate>{event.title}</Text>

      <Text c="dimmed" size="sm">장소: {event.address}</Text>
      <Text c="dimmed" size="sm" mb="lg">
        일시: {startDate} ~ {endDate}
      </Text>

      <Button
        fullWidth
        size="md"
        radius="lg"
        style={{ background: '#3B82F6' }}
        onClick={() => navigate(`/e/${event.slug}`)}
      >
        예약하기
      </Button>
    </Paper>
  );
}
