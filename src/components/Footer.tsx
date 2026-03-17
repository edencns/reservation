import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '@mantine/core';
import { useApp } from '../context/AppContext';

const TERMS_CONTENT = `제1조 (목적)
본 약관은 ReserveTicket(이하 "회사")이 제공하는 입주박람회 예약 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다. ... (이하 생략)`;

const PRIVACY_CONTENT = `개인정보 수집·이용 목적
ReserveTicket은 박람회 방문 예약 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다. ... (이하 생략)`;

export default function Footer() {
  const { companyInfo } = useApp();
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);

  return (
    <footer className="border-t border-white/60 bg-[#e8edf5]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-14 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr] lg:px-10">

        {/* Brand */}
        <div>
          <p className="text-[22px] font-light tracking-[-0.04em] text-[#0d2754]">ReserveTicket</p>
          <p className="mt-5 max-w-[340px] text-[15px] leading-[1.9] text-[#6b778c]">
            성공적인 입주 박람회를 위한 최고의 선택.<br />
            {companyInfo.name || '이든씨엔에스 주식회사'}<br />
            {companyInfo.address || '경기도 수원시 영통구'}<br />
            {companyInfo.email || 'edencns1999@naver.com'}
          </p>
          <p className="mt-10 text-xs text-[#9aa5b4]">
            © {new Date().getFullYear()} ReserveTicket. All rights reserved.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <p className="text-sm font-semibold text-[#17315d]">바로가기</p>
          <div className="mt-5 space-y-3 text-sm text-[#66748b]">
            <Link to="/" className="block transition hover:text-[#17315d]">홈</Link>
            <Link to="/events" className="block transition hover:text-[#17315d]">박람회 목록</Link>
            <Link to="/my-tickets" className="block transition hover:text-[#17315d]">내 예약 확인</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <p className="text-sm font-semibold text-[#17315d]">법적 고지</p>
          <div className="mt-5 space-y-3 text-sm text-[#66748b]">
            <button
              onClick={() => setModal({ title: '이용약관', body: TERMS_CONTENT })}
              className="block text-left transition hover:text-[#17315d]"
            >
              이용약관
            </button>
            <button
              onClick={() => setModal({ title: '개인정보처리방침', body: PRIVACY_CONTENT })}
              className="block text-left transition hover:text-[#17315d]"
            >
              개인정보처리방침
            </button>
          </div>
        </div>

        {/* Admin */}
        <div>
          <p className="text-sm font-semibold text-[#17315d]">관리자</p>
          <div className="mt-5 space-y-3 text-sm text-[#66748b]">
            <Link to="/admin" className="block transition hover:text-[#17315d]">관리자 로그인</Link>
          </div>
        </div>
      </div>

      <Modal opened={!!modal} onClose={() => setModal(null)} title={modal?.title} size="lg" centered>
        <p className="text-sm leading-7 text-[#66748b] whitespace-pre-wrap">{modal?.body}</p>
        <button
          onClick={() => setModal(null)}
          className="mt-6 w-full rounded-xl bg-[#0a3d78] py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          확인
        </button>
      </Modal>
    </footer>
  );
}
