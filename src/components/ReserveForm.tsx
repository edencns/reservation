"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const SERVICES = [
  "인테리어",
  "가전·가구",
  "이사·청소",
  "금융·대출",
  "커뮤니티",
  "기타",
] as const;

type Service = (typeof SERVICES)[number];

interface ReserveFormProps {
  eventTitle?: string;
  eventDate?: string;
  eventPlace?: string;
  eventSlug?: string;
}

export default function ReserveForm({
  eventTitle = "힐스테이트 광교 입주 박람회",
  eventDate = "2025.04.12 ~ 13",
  eventPlace = "광교 A동 커뮤니티센터",
}: ReserveFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    unitNumber: "",
  });
  const [services, setServices] = useState<Set<Service>>(new Set());
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleService = (s: Service) => {
    setServices((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "이름을 입력해 주세요.";
    if (!form.phone.trim()) e.phone = "연락처를 입력해 주세요.";
    if (!form.unitNumber.trim()) e.unitNumber = "동호수를 입력해 주세요.";
    if (!agreed) e.agreed = "개인정보 수집·이용에 동의해 주세요.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    // TODO: API 연동
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push("/reservation-complete");
  };

  const inputClass = (field: string) =>
    cn(
      "w-full bg-[#f9fafc] border rounded-lg px-4 py-3 text-[14px] text-[#0e1427] placeholder:text-[#babdc4] outline-none transition-colors",
      errors[field]
        ? "border-[#db3838] focus:border-[#db3838]"
        : "border-[#e1e2e9] focus:border-[#2660f0]"
    );

  return (
    <div className="min-h-screen bg-[#f4f5f8] py-8">
      <div className="max-w-[1280px] mx-auto px-6">

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {[
            { label: "이벤트 선택", done: true },
            { label: "정보 입력", active: true },
            { label: "완료" },
          ].map((step, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div
                  className="w-[156px] h-0.5 mx-1"
                  style={{
                    backgroundColor: i === 1 && step.done ? "#0eb077" : i <= 1 ? "#0eb077" : "#e1e2e9",
                  }}
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white transition-all",
                  )}
                  style={
                    step.done
                      ? { backgroundColor: "#0eb077" }
                      : step.active
                      ? { background: "linear-gradient(135deg, #2660f0 0%, #4523eb 100%)" }
                      : { backgroundColor: "#e1e2e9" }
                  }
                >
                  {step.done ? <Check size={12} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] whitespace-nowrap",
                    step.done ? "text-[#0eb077] font-semibold" : step.active ? "text-[#2660f0] font-semibold" : "text-[#b2b6bf]"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-6 items-start">
          {/* ── 폼 카드 ── */}
          <div className="flex-1 bg-white rounded-2xl shadow-[0px_8px_28px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* 상단 그라디언트 바 */}
            <div
              className="h-[5px] w-full"
              style={{ background: "linear-gradient(90deg, #2660f0 0%, #4523eb 100%)" }}
            />

            <div className="px-10 py-8">
              <h2 className="text-[20px] font-bold text-[#0e1427] mb-1.5">예약자 정보</h2>
              <p className="text-[13px] text-[#6b7283] mb-6">
                {eventTitle} · {eventDate}
              </p>
              <div className="h-px bg-[#eff0f4] mb-7" />

              {/* 입력 필드들 */}
              <div className="grid grid-cols-1 gap-6">
                {/* 이름 */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#262e42] mb-2">
                    이름 <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2660f0] align-middle ml-1 mb-0.5" />
                  </label>
                  <input
                    className={inputClass("name")}
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-[#db3838]">{errors.name}</p>}
                </div>

                {/* 연락처 */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#262e42] mb-2">
                    연락처 <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2660f0] align-middle ml-1 mb-0.5" />
                  </label>
                  <input
                    className={inputClass("phone")}
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <p className="mt-1 text-[11px] text-[#db3838]">{errors.phone}</p>}
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#262e42] mb-2">
                    이메일
                  </label>
                  <input
                    className={inputClass("email")}
                    placeholder="example@email.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {/* 동호수 */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#262e42] mb-2">
                    동호수 <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2660f0] align-middle ml-1 mb-0.5" />
                  </label>
                  <input
                    className={inputClass("unitNumber")}
                    placeholder="예) 101동 1502호"
                    value={form.unitNumber}
                    onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                  />
                  {errors.unitNumber && <p className="mt-1 text-[11px] text-[#db3838]">{errors.unitNumber}</p>}
                </div>
              </div>

              {/* 관심 서비스 */}
              <div className="mt-7 pt-7 border-t border-[#eff0f4]">
                <p className="text-[13px] font-semibold text-[#262e42] mb-1">관심 서비스</p>
                <p className="text-[12px] text-[#6b7283] mb-4">관심 있는 항목을 선택해 주세요 (선택사항)</p>
                <div className="grid grid-cols-3 gap-3">
                  {SERVICES.map((s) => {
                    const checked = services.has(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleService(s)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] transition-all",
                          checked
                            ? "border-[#2660f0] bg-[#ebefff] text-[#2660f0] font-semibold"
                            : "border-[#e1e2e9] bg-white text-[#4f576a] hover:border-[#b2b4e0]"
                        )}
                      >
                        <span
                          className={cn(
                            "w-4 h-4 rounded flex items-center justify-center shrink-0",
                            checked ? "text-white" : "border border-[#e1e2e9]"
                          )}
                          style={checked ? { background: "linear-gradient(135deg, #2660f0 0%, #4523eb 100%)" } : {}}
                        >
                          {checked && <Check size={10} />}
                        </span>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 개인정보 동의 */}
              <div className="mt-7 pt-7 border-t border-[#eff0f4]">
                <button
                  type="button"
                  onClick={() => setAgreed((v) => !v)}
                  className="flex items-center gap-3 group"
                >
                  <span
                    className="w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 transition-all"
                    style={
                      agreed
                        ? { background: "linear-gradient(135deg, #2660f0 0%, #4523eb 100%)" }
                        : { border: "1.5px solid #e1e2e9", background: "white" }
                    }
                  >
                    {agreed && <Check size={11} color="white" />}
                  </span>
                  <span className="text-[12px] text-[#4f576a]">
                    개인정보 수집·이용에 동의합니다 <span className="text-[#db3838]">(필수)</span>
                  </span>
                </button>
                {errors.agreed && <p className="mt-1 text-[11px] text-[#db3838] ml-7">{errors.agreed}</p>}
              </div>

              {/* 제출 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-7 w-full py-3.5 rounded-xl text-[15px] font-semibold text-white shadow-[0px_5px_16px_rgba(38,96,240,0.25)] transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                style={{ background: "linear-gradient(120deg, #2660f0 0%, #4523eb 100%)" }}
              >
                {loading ? "처리 중..." : "예약 신청하기"}
              </button>
            </div>
          </div>

          {/* ── 이벤트 요약 카드 ── */}
          <div className="w-[210px] shrink-0 bg-white rounded-2xl shadow-[0px_4px_14px_rgba(0,0,0,0.06)] overflow-hidden sticky top-24">
            <div
              className="h-1"
              style={{ background: "linear-gradient(90deg, #2660f0 0%, #4523eb 100%)" }}
            />
            <div className="p-5">
              <p className="text-[11px] text-[#6b7283] mb-2">선택한 이벤트</p>
              <h3 className="text-[15px] font-bold text-[#0e1427] leading-snug mb-4">
                {eventTitle}
              </h3>
              <div className="h-px bg-[#eff0f4] mb-4" />
              <p className="text-[11px] text-[#6b7283] mb-1">일정</p>
              <p className="text-[12px] font-medium text-[#262e42] mb-4">{eventDate}</p>
              <p className="text-[11px] text-[#6b7283] mb-1">장소</p>
              <p className="text-[12px] font-medium text-[#262e42] leading-snug">{eventPlace}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
