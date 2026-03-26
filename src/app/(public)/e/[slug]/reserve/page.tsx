import ReserveForm from "@/components/ReserveForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "hilstate-gwanggyo" },
    { slug: "raemian-onebailey" },
    { slug: "dh-bangbae" },
    { slug: "acro-riverheim" },
    { slug: "xi-thepark" },
  ];
}

const EVENT_MAP: Record<string, { title: string; date: string; place: string }> = {
  "hilstate-gwanggyo": {
    title: "힐스테이트 광교 입주 박람회",
    date: "2025.04.12 ~ 13",
    place: "광교 A동 커뮤니티센터",
  },
  "raemian-onebailey": {
    title: "래미안 원베일리 입주 박람회",
    date: "2025.04.19 ~ 20",
    place: "반포 B동 주민홀",
  },
  "dh-bangbae": {
    title: "디에이치 방배 입주 박람회",
    date: "2025.04.26 ~ 27",
    place: "방배 커뮤니티센터",
  },
  "acro-riverheim": {
    title: "아크로 리버하임 입주 박람회",
    date: "2025.05.03",
    place: "서초 커뮤니티홀",
  },
  "xi-thepark": {
    title: "자이 더 파크 입주 박람회",
    date: "2025.05.10",
    place: "은평 문화센터",
  },
};

export default async function ReservePage({ params }: Props) {
  const { slug } = await params;
  const event = EVENT_MAP[slug] ?? {
    title: "입주 박람회",
    date: "-",
    place: "-",
  };

  return (
    <ReserveForm
      eventTitle={event.title}
      eventDate={event.date}
      eventPlace={event.place}
      eventSlug={slug}
    />
  );
}
