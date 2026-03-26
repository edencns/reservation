"use client";

import { useRouter } from "next/navigation";
import type { Event } from "../types";
import { formatDate } from "../utils/helpers";

interface EventCardProps {
  event: Event;
  plain?: boolean;
}

export function EventCard({ event, plain }: EventCardProps) {
  const router = useRouter();

  const startDate = event.dates[0] ? formatDate(event.dates[0]) : "";
  const endDate =
    event.dates.length > 1
      ? formatDate(event.dates[event.dates.length - 1])
      : "";

  const content = (
    <>
      <div className={`aspect-video mb-4 overflow-hidden rounded-xl ${plain ? "mx-8" : ""}`}>
        <img
          src={event.imageUrl || "https://via.placeholder.com/400x225?text=Event+Image"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="font-bold text-lg mb-1 truncate text-on-surface">{event.title}</p>
      <p className="text-sm text-on-surface-variant mb-1">장소: {event.address}</p>
      <p className="text-sm text-on-surface-variant mb-5">
        일시: {startDate} ~ {endDate}
      </p>
      <button
        onClick={() => router.push(`/e/${event.slug}`)}
        className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
      >
        예약하기
      </button>
    </>
  );

  if (plain) return content;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm p-5 hover:shadow-md transition-shadow">
      {content}
    </div>
  );
}
