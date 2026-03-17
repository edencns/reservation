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
    <footer style={{ background: 'var(--surface-container-highest)', borderTop: '1px solid rgba(194,199,209,0.2)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">

          {/* Brand */}
          <div className="max-w-sm">
            <span className="block text-xl font-extrabold mb-4" style={{ color: 'var(--primary)', fontFamily: 'Manrope, sans-serif' }}>
              ReserveTicket
            </span>
            <p className="text-sm leading-loose" style={{ color: 'var(--on-surface-variant)' }}>
              성공적인 입주 박람회를 위한 최고의 선택.<br />
              {companyInfo.name || '이든씨엔에스 주식회사'}
            </p>
            <p className="text-xs mt-3" style={{ color: 'var(--outline)' }}>
              {companyInfo.address || '경기도 수원시 영통구'}<br />
              {companyInfo.email || 'edencns1999@naver.com'}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>바로가기</span>
              <Link to="/" className="text-sm transition-colors" style={{ color: 'var(--on-surface-variant)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-variant)')}>홈</Link>
              <Link to="/events" className="text-sm transition-colors" style={{ color: 'var(--on-surface-variant)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-variant)')}>박람회 목록</Link>
              <Link to="/my-tickets" className="text-sm transition-colors" style={{ color: 'var(--on-surface-variant)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-variant)')}>내 예약 확인</Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>법적 고지</span>
              <button
                onClick={() => setModalContent({ title: '이용약관', body: TERMS_CONTENT })}
                className="text-sm text-left transition-colors"
                style={{ color: 'var(--on-surface-variant)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
              >이용약관</button>
              <button
                onClick={() => setModalContent({ title: '개인정보처리방침', body: PRIVACY_CONTENT })}
                className="text-sm text-left transition-colors"
                style={{ color: 'var(--on-surface-variant)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-variant)')}
              >개인정보처리방침</button>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>관리자</span>
              <Link to="/admin" className="text-sm transition-colors" style={{ color: 'var(--on-surface-variant)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-variant)')}>관리자 로그인</Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t text-center md:text-left" style={{ borderColor: 'rgba(194,199,209,0.15)' }}>
          <p className="text-xs opacity-60" style={{ color: 'var(--on-surface-variant)' }}>
            © {new Date().getFullYear()} ReserveTicket. All rights reserved.
          </p>
        </div>
      </div>

      <Modal
        opened={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.title}
        size="lg"
        centered
      >
        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--on-surface-variant)' }}>{modalContent?.body}</p>
        <button
          onClick={() => setModalContent(null)}
          className="w-full mt-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
          style={{ background: 'var(--primary)' }}
        >
          확인
        </button>
      </Modal>
    </footer>
  );
}
