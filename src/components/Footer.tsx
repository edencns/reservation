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
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  return (
    <footer style={{ background: '#e8edf3', borderTop: '1px solid rgba(255,255,255,0.5)' }}>
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-14 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr] lg:px-10">

        {/* Brand */}
        <div>
          <div
            style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.04em', color: '#0d2754' }}
          >
            ReserveTicket
          </div>
          <p className="mt-6 max-w-[360px] text-[15px] leading-8" style={{ color: '#6b778c' }}>
            성공적인 입주 박람회를 위한 최고의 선택.<br />
            {companyInfo.name || '이든씨엔에스 주식회사'}<br />
            {companyInfo.address || '경기도 수원시 영통구'}<br />
            {companyInfo.email || 'edencns1999@naver.com'}
          </p>
          <div className="mt-10 text-xs" style={{ color: '#8a94a6' }}>
            © {new Date().getFullYear()} ReserveTicket. All rights reserved.
          </div>
        </div>

        {/* Navigate */}
        <div>
          <div className="text-sm font-semibold" style={{ color: '#17315d' }}>바로가기</div>
          <div className="mt-5 space-y-3 text-sm" style={{ color: '#66748b' }}>
            <Link to="/" className="block transition hover:text-[#17315d]">홈</Link>
            <Link to="/events" className="block transition hover:text-[#17315d]">박람회 목록</Link>
            <Link to="/my-tickets" className="block transition hover:text-[#17315d]">내 예약 확인</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <div className="text-sm font-semibold" style={{ color: '#17315d' }}>법적 고지</div>
          <div className="mt-5 space-y-3 text-sm" style={{ color: '#66748b' }}>
            <button
              onClick={() => setModalContent({ title: '이용약관', body: TERMS_CONTENT })}
              className="block text-left transition hover:text-[#17315d]"
            >
              이용약관
            </button>
            <button
              onClick={() => setModalContent({ title: '개인정보처리방침', body: PRIVACY_CONTENT })}
              className="block text-left transition hover:text-[#17315d]"
            >
              개인정보처리방침
            </button>
          </div>
        </div>

        {/* Admin */}
        <div>
          <div className="text-sm font-semibold" style={{ color: '#17315d' }}>관리자</div>
          <div className="mt-5 space-y-3 text-sm" style={{ color: '#66748b' }}>
            <Link to="/admin" className="block transition hover:text-[#17315d]">관리자 로그인</Link>
          </div>
        </div>
      </div>

      <Modal
        opened={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.title}
        size="lg"
        centered
      >
        <p className="text-sm whitespace-pre-wrap" style={{ color: '#66748b' }}>{modalContent?.body}</p>
        <button
          onClick={() => setModalContent(null)}
          className="w-full mt-6 py-3 rounded-xl text-white font-medium transition hover:opacity-90"
          style={{ background: '#0a3d78' }}
        >
          확인
        </button>
      </Modal>
    </footer>
  );
}
