'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

const services = [
  { id: 'interior', label: '인테리어' },
  { id: 'appliance', label: '가전·가구' },
  { id: 'moving', label: '이사·청소' },
  { id: 'finance', label: '금융·대출' },
  { id: 'community', label: '커뮤니티' },
  { id: 'etc', label: '기타' },
];

const gradient = 'linear-gradient(135deg, #4523eb 14.6%, #2660f0 85.4%)';

export default function ReservationPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unit, setUnit] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(['interior', 'moving']);
  const [agreePrivacy, setAgreePrivacy] = useState(true);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex flex-col">
      {/* ─────────── Header ─────────── */}
      <header className="sticky top-0 z-50 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.06)] h-16">
        <div className="max-w-[1280px] mx-auto px-10 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center"
              style={{ background: gradient }}
            >
              <span className="text-white text-[13px] font-extrabold tracking-wide">ET</span>
            </div>
            <span className="text-[#0e1427] text-base font-bold">EDEN Ticket</span>
          </div>
          <nav className="flex gap-10">
            <a href="/events" className="text-[#6b7283] text-sm hover:text-[#0e1427] transition-colors">
              이벤트
            </a>
            <a href="/lookup" className="text-[#6b7283] text-sm hover:text-[#0e1427] transition-colors">
              예약 조회
            </a>
          </nav>
        </div>
      </header>

      {/* ─────────── Stepper ─────────── */}
      <div className="flex items-center justify-center gap-0 pt-5 pb-2">
        {/* Step 1 - 완료 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-[#0eb077] flex items-center justify-center">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-[11px] font-semibold text-[#0eb077] mt-2">이벤트 선택</span>
        </div>

        {/* Line 1 */}
        <div className="w-[156px] h-0.5 bg-[#0eb077] mt-[-14px]" />

        {/* Step 2 - 현재 */}
        <div className="flex flex-col items-center">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.2)]"
            style={{ background: gradient }}
          >
            <span className="text-white text-[11px] font-bold">2</span>
          </div>
          <span className="text-[11px] font-semibold text-[#2660f0] mt-2">정보 입력</span>
        </div>

        {/* Line 2 */}
        <div className="w-[156px] h-0.5 bg-[#e0e2e8] mt-[-14px]" />

        {/* Step 3 - 대기 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-[#e0e2e8] flex items-center justify-center">
            <span className="text-[#b2b6bf] text-[11px] font-bold">3</span>
          </div>
          <span className="text-[11px] text-[#b2b6bf] mt-2">완료</span>
        </div>
      </div>

      {/* ─────────── Main Content ─────────── */}
      <main className="max-w-[1280px] mx-auto w-full flex gap-8 px-10 pt-2 pb-10">
        {/* Form Card */}
        <div className="w-[700px] mx-auto bg-white rounded-[20px] shadow-[0_8px_28px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-[5px] rounded-t-[20px]" style={{ background: 'linear-gradient(to right, #4523eb, #2660f0)' }} />

          <div className="px-10 pt-9 pb-10">
            <h2 className="text-xl font-bold text-[#0e1427]">예약자 정보</h2>
            <p className="text-[13px] text-[#6b7283] mt-2">
              힐스테이트 광교 입주 박람회 · 2025.04.12 ~ 13
            </p>

            <div className="h-px bg-[#eff0f4] mt-5 mb-5" />

            {/* 이름 */}
            <div className="mb-5">
              <label className="text-[13px] font-semibold text-[#262e42]">
                이름 <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#db3838] ml-1 mb-1" />
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full h-11 mt-2 px-4 rounded-lg bg-[#f9fafd] border-[1.5px] border-[#e0e2e8] text-sm text-[#0e1427] placeholder:text-[#bac2d1] focus:border-[#2660f0] focus:outline-none transition-colors"
              />
            </div>

            {/* 연락처 */}
            <div className="mb-5">
              <label className="text-[13px] font-semibold text-[#262e42]">
                연락처 <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#db3838] ml-1 mb-1" />
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full h-11 mt-2 px-4 rounded-lg bg-[#f9fafd] border-[1.5px] border-[#e0e2e8] text-sm text-[#0e1427] placeholder:text-[#bac2d1] focus:border-[#2660f0] focus:outline-none transition-colors"
              />
            </div>

            {/* 이메일 */}
            <div className="mb-5">
              <label className="text-[13px] font-semibold text-[#262e42]">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full h-11 mt-2 px-4 rounded-lg bg-[#f9fafd] border-[1.5px] border-[#e0e2e8] text-sm text-[#0e1427] placeholder:text-[#bac2d1] focus:border-[#2660f0] focus:outline-none transition-colors"
              />
            </div>

            {/* 동호수 */}
            <div className="mb-5">
              <label className="text-[13px] font-semibold text-[#262e42]">
                동호수 <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#db3838] ml-1 mb-1" />
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="예) 101동 1502호"
                className="w-full h-11 mt-2 px-4 rounded-lg bg-[#f9fafd] border-[1.5px] border-[#e0e2e8] text-sm text-[#0e1427] placeholder:text-[#bac2d1] focus:border-[#2660f0] focus:outline-none transition-colors"
              />
            </div>

            <div className="h-px bg-[#eff0f4] mt-5 mb-5" />

            {/* 관심 서비스 */}
            <p className="text-[13px] font-semibold text-[#262e42]">관심 서비스</p>
            <p className="text-xs text-[#6b7283] mt-1 mb-4">관심 있는 항목을 선택해 주세요 (선택사항)</p>

            <div className="grid grid-cols-3 gap-x-[140px] gap-y-4">
              {services.map((s) => {
                const checked = selectedServices.includes(s.id);
                return (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <div
                      className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all ${
                        checked ? '' : 'border-[1.5px] border-[#e0e2e8] bg-white'
                      }`}
                      style={checked ? { background: gradient } : undefined}
                      onClick={() => toggleService(s.id)}
                    >
                      {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <span
                      className={`text-xs transition-colors ${
                        checked
                          ? 'font-semibold text-[#2660f0] bg-[#ebefff] px-2 py-1 rounded-md'
                          : 'text-[#4f576a]'
                      }`}
                      onClick={() => toggleService(s.id)}
                    >
                      {s.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="h-px bg-[#eff0f4] mt-6 mb-4" />

            {/* 개인정보 동의 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all ${
                  agreePrivacy ? '' : 'border-[1.5px] border-[#e0e2e8] bg-white'
                }`}
                style={agreePrivacy ? { background: gradient } : undefined}
                onClick={() => setAgreePrivacy(!agreePrivacy)}
              >
                {agreePrivacy && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs text-[#4f576a]" onClick={() => setAgreePrivacy(!agreePrivacy)}>
                개인정보 수집·이용에 동의합니다 (필수)
              </span>
            </label>

            {/* 제출 버튼 */}
            <button
              className="w-full h-12 mt-6 rounded-xl text-[15px] font-semibold text-white shadow-[0_5px_16px_rgba(0,0,0,0.2)] hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(177deg, #4523eb 13.4%, #2660f0 86.6%)' }}
            >
              예약 신청하기
            </button>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="w-[210px] shrink-0 bg-white rounded-[14px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] h-fit overflow-hidden self-start">
          <div className="h-1 rounded-t-[14px]" style={{ background: 'linear-gradient(to right, #4523eb, #2660f0)' }} />
          <div className="p-[18px]">
            <p className="text-[11px] text-[#6b7283]">선택한 이벤트</p>
            <div className="mt-2 mb-3">
              <p className="text-[15px] font-bold text-[#0e1427] leading-[22px]">힐스테이트 광교</p>
              <p className="text-[15px] font-bold text-[#0e1427] leading-[22px]">입주 박람회</p>
            </div>
            <div className="h-px bg-[#eff0f4] mb-3" />
            <p className="text-[11px] text-[#6b7283]">일정</p>
            <p className="text-xs font-medium text-[#262e42] mt-1">2025.04.12 ~ 04.13</p>
            <p className="text-[11px] text-[#6b7283] mt-3">장소</p>
            <p className="text-xs font-medium text-[#262e42] mt-1 leading-[18px]">
              광교 A동<br />커뮤니티센터
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
