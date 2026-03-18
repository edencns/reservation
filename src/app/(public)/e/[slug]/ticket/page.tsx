import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = { title: "내 티켓 조회" };

export default async function TicketPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">티켓 조회</h1>
      <p className="mb-8 text-sm text-slate-500">
        이벤트: <span className="font-medium text-slate-700">{slug}</span>
      </p>

      {/* Ticket lookup form — built in Step 3 */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-slate-400">
        <p className="text-sm">티켓 조회는 Step 3에서 구현됩니다.</p>
      </div>
    </div>
  );
}
