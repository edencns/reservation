"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GRAD = "linear-gradient(-45deg, #2660f0 14.645%, #4523eb 85.355%)";

const SERVICES = [
  { id: "interior", label: "인테리어" },
  { id: "appliances", label: "가전·가구" },
  { id: "moving", label: "이사·청소" },
  { id: "finance", label: "금융·대출" },
  { id: "community", label: "커뮤니티" },
  { id: "etc", label: "기타" },
];

type Props = { params: { slug: string } };

export default function ReservePage({ params }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", phone: "", email: "", unit: "",
  });
  const [services, setServices] = useState<string[]>(["interior", "moving"]);
  const [agreed, setAgreed] = useState(true);

  const toggleService = (id: string) =>
    setServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return alert("개인정보 동의가 필요합니다.");
    router.push(`/e/${params.slug}/ticket`);
  };

  const RequiredDot = () => (
    <span
      className="ml-1 inline-block h-[5px] w-[5px] rounded-full"
      style={{ background: "#2660f0", verticalAlign: "super" }}
    />
  );

  const InputField = ({
    label, required, placeholder, value, onChange, type = "text",
  }: {
    label: string; required?: boolean; placeholder: string;
    value: string; onChange: (v: string) => void; type?: string;
  }) => (
    <div className="mb-[22px]">
      <label className="mb-2 block text-[13px] font-semibold text-[#262e42]">
        {label}{required && <RequiredDot />}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[8px] border border-[#e0e2e8] bg-[#f9fafd] px-4 py-3 text-[14px] text-[#0e1427] placeholder-[#bac2d1] outline-none focus:border-[#2660f0] transition-colors"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f5f8] pb-16">
      {/* 스텝 인디케이터 */}
      <div className="flex items-center justify-center gap-0 pt-8 pb-10">
        {[
          { label: "이벤트 선택", done: true },
          { label: "정보 입력", active: true },
          { label: "완료", inactive: true },
        ].map((step, i) => (
          <div key={i} className="flex items-center">
            {i > 0 && (
              <div
                className="h-0.5 w-[156px]"
                style={{ background: i === 1 ? "#e0e2e8" : "#0eb077" }}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className="mb-2 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={
                  step.done
                    ? { background: "#0eb077" }
                    : step.active
                    ? { background: GRAD, boxShadow: "0px 3px 8px rgba(0,0,0,0.2)" }
                    : { background: "#e0e2e8" }
                }
              >
                {step.done ? "✓" : i + 1}
              </div>
              <span
                className="text-[11px]"
                style={{
                  color: step.done ? "#0eb077" : step.active ? "#2660f0" : "#b2b6bf",
                  fontWeight: step.active || step.done ? 600 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1280px] gap-6 px-10">
        {/* 메인 폼 카드 */}
        <div
          className="flex-1 rounded-[20px] bg-white"
          style={{ boxShadow: "0px 8px 28px rgba(0,0,0,0.08)" }}
        >
          {/* 상단 그라디언트 바 */}
          <div className="h-[5px] w-full rounded-t-[20px]" style={{ background: GRAD }} />

          <form onSubmit={handleSubmit} className="px-10 py-9">
            <h2 className="mb-1 text-[20px] font-bold text-[#0e1427]">예약자 정보</h2>
            <p className="mb-6 text-[13px] text-[#6b7283]">
              힐스테이트 광교 입주 박람회 · 2025.04.12 ~ 13
            </p>
            <div className="mb-6 h-px bg-[#eff0f4]" />

            <InputField
              label="이름" required placeholder="홍길동"
              value={form.name} onChange={(v) => setForm({ ...form, name: v })}
            />
            <InputField
              label="연락처" required placeholder="010-0000-0000"
              value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel"
            />
            <InputField
              label="이메일" placeholder="example@email.com"
              value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email"
            />
            <InputField
              label="동호수" required placeholder="예) 101동 1502호"
              value={form.unit} onChange={(v) => setForm({ ...form, unit: v })}
            />

            {/* 관심 서비스 */}
            <div className="mb-6 h-px bg-[#eff0f4]" />
            <p className="mb-1 text-[13px] font-semibold text-[#262e42]">관심 서비스</p>
            <p className="mb-4 text-[12px] text-[#6b7283]">관심 있는 항목을 선택해 주세요 (선택사항)</p>

            <div className="mb-6 grid grid-cols-3 gap-y-3">
              {SERVICES.map((svc) => {
                const on = services.includes(svc.id);
                return (
                  <label key={svc.id} className="flex cursor-pointer items-center gap-2">
                    <span
                      className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] text-[10px] font-bold text-white"
                      style={
                        on
                          ? { background: GRAD }
                          : { background: "#fff", border: "1.5px solid #e0e2e8" }
                      }
                      onClick={() => toggleService(svc.id)}
                    >
                      {on && "✓"}
                    </span>
                    {on ? (
                      <span
                        className="rounded-[6px] px-2 py-0.5 text-[12px] font-semibold"
                        style={{ background: "#ebefff", color: "#2660f0" }}
                      >
                        {svc.label}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#4f576a]">{svc.label}</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* 동의 */}
            <div className="mb-6 h-px bg-[#eff0f4]" />
            <label className="flex cursor-pointer items-center gap-2 mb-6">
              <span
                className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[4px] text-[10px] font-bold text-white"
                style={agreed ? { background: GRAD } : { background: "#fff", border: "1.5px solid #e0e2e8" }}
                onClick={() => setAgreed(!agreed)}
              >
                {agreed && "✓"}
              </span>
              <span className="text-[12px] text-[#4f576a]">
                개인정보 수집·이용에 동의합니다 (필수)
              </span>
            </label>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="h-[48px] w-full rounded-[12px] text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: GRAD, boxShadow: "0px 5px 16px rgba(0,0,0,0.2)" }}
            >
              예약 신청하기
            </button>
          </form>
        </div>

        {/* 이벤트 정보 사이드 카드 */}
        <div
          className="w-[210px] flex-shrink-0 self-start rounded-[14px] bg-white"
          style={{ boxShadow: "0px 4px 14px rgba(0,0,0,0.06)" }}
        >
          <div className="h-1 w-full rounded-t-[14px]" style={{ background: GRAD }} />
          <div className="p-[18px]">
            <p className="mb-2 text-[11px] text-[#6b7283]">선택한 이벤트</p>
            <div className="mb-4 text-[15px] font-bold leading-[22px] text-[#0e1427]">
              <p>힐스테이트 광교</p>
              <p>입주 박람회</p>
            </div>
            <div className="mb-4 h-px bg-[#eff0f4]" />
            <p className="mb-1 text-[11px] text-[#6b7283]">일정</p>
            <p className="mb-4 text-[12px] font-medium text-[#262e42]">2025.04.12 ~ 04.13</p>
            <p className="mb-1 text-[11px] text-[#6b7283]">장소</p>
            <div className="text-[12px] font-medium leading-[18px] text-[#262e42]">
              <p>광교 A동</p>
              <p>커뮤니티센터</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
