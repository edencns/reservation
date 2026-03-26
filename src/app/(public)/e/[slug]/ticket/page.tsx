// src/app/(public)/e/[slug]/ticket/page.tsx
import Link from "next/link";

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

export default async function TicketPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-[20px] font-bold text-[#0e1427] mb-2">예약 조회</h1>
        <p className="text-[14px] text-[#6b7283] mb-6">
          예약 번호 또는 연락처로 예약 내역을 확인하세요.
        </p>
        <input
          type="text"
          placeholder="연락처 또는 예약번호 입력"
          className="w-full border border-[#e1e2e9] rounded-xl px-4 py-3 text-[14px] mb-4 outline-none focus:border-[#2660f0]"
        />
        <button
          className="w-full py-3 rounded-xl text-[15px] font-semibold text-white"
          style={{ background: "linear-gradient(120deg, #2660f0 0%, #4523eb 100%)" }}
        >
          조회하기
        </button>
        <Link
          href={`/e/${slug}`}
          className="block mt-4 text-[13px] text-[#6b7283] hover:text-[#2660f0]"
        >
          ← 이벤트로 돌아가기
        </Link>
      </div>
    </div>
  );
}
