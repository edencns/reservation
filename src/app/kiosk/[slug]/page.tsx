import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "현장 키오스크" };

export default async function KioskPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          티켓 출력 키오스크
        </h1>
        <p className="mt-3 text-slate-400">
          이벤트: <span className="text-slate-200 font-medium">{slug}</span>
        </p>
        <p className="mt-6 text-slate-500 text-sm">
          가상 키패드 및 QR 출력 — Step 5에서 구현됩니다.
        </p>
      </div>
    </div>
  );
}
