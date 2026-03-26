"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES = ["인테리어", "가전·가구", "이사·청소", "금융·대출", "커뮤니티", "기타"] as const;
type Service = (typeof SERVICES)[number];

const GRAD = "linear-gradient(-45deg, rgb(38,96,240) 14.6%, rgb(69,35,235) 85.4%)";

interface Props {
  eventTitle?: string;
  eventLine1?: string;
  eventLine2?: string;
  eventDate?: string;
  eventPlace?: string;
  eventSlug?: string;
}

export default function ReserveForm({
  eventTitle = "힐스테이트 광교 입주 박람회",
  eventLine1 = "힐스테이트 광교",
  eventLine2 = "입주 박람회",
  eventDate = "2025.04.12 ~ 13",
  eventPlace = "광교 A동 커뮤니티센터",
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", unit: "" });
  const [services, setServices] = useState<Set<Service>>(new Set(["인테리어", "이사·청소"]));
  const [agreed, setAgreed] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const toggleService = (s: Service) =>
    setServices((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "이름을 입력해 주세요.";
    if (!form.phone.trim()) e.phone = "연락처를 입력해 주세요.";
    if (!form.unit.trim()) e.unit = "동호수를 입력해 주세요.";
    if (!agreed) e.agreed = "개인정보 수집·이용에 동의해 주세요.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push("/reservation-complete");
  };

  const inputCls = (field: string) => cn(
    "w-full h-11 px-4 rounded-lg border bg-[#f9fafd] text-[14px] text-[#0e1427] placeholder:text-[#bac2d1] outline-none transition-colors",
    errors[field] ? "border-red-400 focus:border-red-400" : "border-[#e0e2e8] focus:border-[#2660f0]"
  );

  return (
    <div className="min-h-screen bg-[#f4f5f8] pb-16">
      {/* 스텝 인디케이터 — Figma 기준: steps at left 448, 632, 816 (center=1280/2=640 → offset 192) */}
      <div className="flex items-start justify-center gap-0 pt-[84px] pb-[40px]">
        {/* Step 1 — 완료 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0eb077" }}>
            <Check size={12} color="white" strokeWidth={3} />
          </div>
          <span className="text-[11px] font-semibold text-[#0eb077] mt-[8px]">이벤트 선택</span>
        </div>

        {/* 완료 연결선 */}
        <div className="w-[156px] h-0.5 mt-[14px] bg-[#0eb077]" />

        {/* Step 2 — 활성 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-[0px_3px_8px_rgba(0,0,0,0.2)]"
            style={{ backgroundImage: GRAD }}>
            2
          </div>
          <span className="text-[11px] font-semibold text-[#2660f0] mt-[8px]">정보 입력</span>
        </div>

        {/* 비활성 연결선 */}
        <div className="w-[156px] h-0.5 mt-[14px] bg-[#e0e2e8]" />

        {/* Step 3 — 비활성 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-[#b2b6bf] bg-[#e0e2e8]">3</div>
          <span className="text-[11px] text-[#b2b6bf] mt-[8px]">완료</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-8 flex gap-6 items-start justify-center">
        {/* ── 폼 카드 — w:700 ── */}
        <div className="w-[700px] bg-white rounded-[20px] shadow-[0px_8px_28px_rgba(0,0,0,0.08)] overflow-hidden shrink-0">
          {/* 상단 그라디언트 바 */}
          <div className="h-[5px] w-full" style={{ backgroundImage: "linear-gradient(90deg, #2660f0 0%, #4523eb 100%)" }} />

          <div className="px-10 py-9">
            <h2 className="text-[20px] font-bold text-[#0e1427] mb-1">예약자 정보</h2>
            <p className="text-[13px] text-[#6b7283] mb-5">{eventTitle} · {eventDate}</p>
            <div className="h-px bg-[#eff0f4] mb-7" />

            {/* 입력 필드 */}
            {[
              { key: "name",  label: "이름",   req: true,  ph: "홍길동" },
              { key: "phone", label: "연락처", req: true,  ph: "010-0000-0000" },
              { key: "email", label: "이메일", req: false, ph: "example@email.com" },
              { key: "unit",  label: "동호수", req: true,  ph: "예) 101동 1502호" },
            ].map((f, i, arr) => (
              <div key={f.key} className={i < arr.length - 1 ? "mb-6" : "mb-0"}>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[13px] font-semibold text-[#262e42]">{f.label}</span>
                  {f.req && <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#2660f0]" />}
                </div>
                <input
                  className={inputCls(f.key)}
                  placeholder={f.ph}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
                {errors[f.key] && <p className="mt-1 text-[11px] text-red-400">{errors[f.key]}</p>}
              </div>
            ))}

            {/* 관심 서비스 */}
            <div className="mt-7 pt-7 border-t border-[#eff0f4]">
              <p className="text-[13px] font-semibold text-[#262e42] mb-1">관심 서비스</p>
              <p className="text-[12px] text-[#6b7283] mb-4">관심 있는 항목을 선택해 주세요 (선택사항)</p>

              {/* 3열 그리드 — Figma col간격 206px */}
              <div className="grid grid-cols-3 gap-x-0 gap-y-4">
                {SERVICES.map((s) => {
                  const on = services.has(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className="flex items-center gap-[6px] text-left"
                    >
                      {/* 체크박스 */}
                      <span
                        className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0"
                        style={on
                          ? { backgroundImage: GRAD }
                          : { border: "1.5px solid #e0e2e8", backgroundColor: "white" }}
                      >
                        {on && <Check size={10} color="white" strokeWidth={3} />}
                      </span>
                      {/* 라벨 */}
                      {on ? (
                        <span className="inline-block px-2 py-[3px] bg-[#ebefff] rounded-[6px] text-[12px] font-semibold text-[#2660f0]">
                          {s}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#4f576a]">{s}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 개인정보 동의 */}
            <div className="mt-7 pt-7 border-t border-[#eff0f4]">
              <button type="button" onClick={() => setAgreed((v) => !v)} className="flex items-center gap-[10px]">
                <span
                  className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0"
                  style={agreed
                    ? { backgroundImage: GRAD }
                    : { border: "1.5px solid #e0e2e8", backgroundColor: "white" }}
                >
                  {agreed && <Check size={10} color="white" strokeWidth={3} />}
                </span>
                <span className="text-[12px] text-[#4f576a]">
                  개인정보 수집·이용에 동의합니다 <span className="text-[#2660f0]">(필수)</span>
                </span>
              </button>
              {errors.agreed && <p className="mt-1 text-[11px] text-red-400 ml-7">{errors.agreed}</p>}
            </div>

            {/* 제출 버튼 */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-7 w-full h-12 rounded-xl text-[15px] font-semibold text-white shadow-[0px_5px_16px_rgba(0,0,0,0.2)] disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ backgroundImage: "linear-gradient(-2.6deg, rgb(38,96,240) 13.4%, rgb(69,35,235) 86.6%)" }}
            >
              {loading ? "처리 중..." : "예약 신청하기"}
            </button>
          </div>
        </div>

        {/* ── 이벤트 요약 카드 — w:210 ── */}
        <div className="w-[210px] bg-white rounded-[14px] shadow-[0px_4px_14px_rgba(0,0,0,0.06)] overflow-hidden shrink-0 sticky top-[88px]">
          <div className="h-1 w-full" style={{ backgroundImage: "linear-gradient(90deg, #2660f0 0%, #4523eb 100%)" }} />
          <div className="px-[18px] py-[18px]">
            <p className="text-[11px] text-[#6b7283] mb-2">선택한 이벤트</p>
            <div className="text-[15px] font-bold text-[#0e1427] leading-[22px] mb-5">
              <p>{eventLine1}</p>
              <p>{eventLine2}</p>
            </div>
            <div className="h-px bg-[#eff0f4] mb-4" />
            <p className="text-[11px] text-[#6b7283] mb-1">일정</p>
            <p className="text-[12px] font-medium text-[#262e42] mb-4">{eventDate}</p>
            <p className="text-[11px] text-[#6b7283] mb-1">장소</p>
            <p className="text-[12px] font-medium text-[#262e42] leading-[18px]">
              {eventPlace.includes(" ") ? (
                <>
                  {eventPlace.split(" ").slice(0, 2).join(" ")}<br />
                  {eventPlace.split(" ").slice(2).join(" ")}
                </>
              ) : eventPlace}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
