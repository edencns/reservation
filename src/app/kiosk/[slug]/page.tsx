// src/app/kiosk/[slug]/page.tsx

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

export default async function KioskPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#0e1427] flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-[32px] font-bold mb-4">EDEN Ticket 키오스크</h1>
        <p className="text-[16px] text-[#6b7283] mb-8">
          예약 번호 또는 연락처를 입력해 체크인하세요.
        </p>
        <input
          type="text"
          placeholder="연락처 또는 예약번호"
          className="w-[360px] bg-[#1a2540] border border-[#2a3a5e] rounded-xl px-6 py-4 text-[16px] text-white placeholder:text-[#4a5a7e] outline-none focus:border-[#2660f0] mb-4 block mx-auto"
        />
        <button
          className="w-[360px] py-4 rounded-xl text-[16px] font-bold text-white"
          style={{ background: "linear-gradient(120deg, #2660f0 0%, #4523eb 100%)" }}
        >
          체크인
        </button>
        <p className="mt-6 text-[12px] text-[#4a5a7e]">이벤트: {slug}</p>
      </div>
    </div>
  );
}
