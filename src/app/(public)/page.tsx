import Link from "next/link";
import { CalendarDays, QrCode, ShieldCheck, ArrowRight } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "간편한 사전 예약",
    desc: "원하는 날짜와 시간대를 선택하고 몇 분 안에 예약을 완료하세요.",
  },
  {
    icon: QrCode,
    title: "QR 티켓 발급",
    desc: "예약 완료 즉시 QR 코드 티켓이 발급됩니다. 인쇄 또는 화면으로 제시하세요.",
  },
  {
    icon: ShieldCheck,
    title: "안전한 개인정보 보호",
    desc: "개인정보는 AES-256 암호화로 안전하게 보호됩니다.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDB2NmgNdiA2di02aC02em02LTZ2NmgNdiA2di02aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 ring-1 ring-white/20">
              입주박람회 사전예약 시스템
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              스마트한 박람회
              <br />
              <span className="text-blue-200">사전 예약</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-blue-100/90">
              복잡한 줄 없이, 원하는 시간에 박람회를 방문하세요.
              <br className="hidden sm:block" />
              사전 예약으로 쾌적한 관람 환경을 보장합니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl"
              >
                이벤트 둘러보기
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            왜 ReserveTicket인가요?
          </h2>
          <p className="mt-2 text-slate-500">더 스마트한 박람회 경험</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col items-center gap-5 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              지금 바로 예약하세요
            </h2>
            <p className="text-slate-400">예약 완료 후 QR 코드로 현장에서 빠르게 체크인</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition-all hover:-translate-y-0.5 hover:bg-blue-500"
            >
              이벤트 목록 보기
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
