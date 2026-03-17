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
    <>
      <footer className="bg-surface-container-highest py-20 px-8 md:px-20 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-sm">
            <span className="text-primary font-headline font-extrabold text-xl tracking-tight mb-6 block">Move-In Fair</span>
            <p className="text-on-surface-variant text-sm leading-loose">
              성공적인 입주 박람회를 위한 최고의 선택.<br />
              {companyInfo.name || '이든씨엔에스 주식회사'}<br />
              {companyInfo.address || '경기도 수원시 영통구'}<br />
              {companyInfo.email || 'edencns1999@naver.com'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-primary">바로가기</span>
              <Link to="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">홈</Link>
              <Link to="/events" className="text-sm text-on-surface-variant hover:text-primary transition-colors">박람회 목록</Link>
              <Link to="/my-tickets" className="text-sm text-on-surface-variant hover:text-primary transition-colors">내 예약</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold text-primary">고객 지원</span>
              <Link to="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">문의하기</Link>
              <button
                onClick={() => setModal({ title: '개인정보처리방침', body: PRIVACY_CONTENT })}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                개인정보처리방침
              </button>
              <button
                onClick={() => setModal({ title: '이용약관', body: TERMS_CONTENT })}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                이용약관
              </button>
            </div>
            <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
              <span className="font-bold text-primary">관리자</span>
              <Link to="/admin" className="text-sm text-on-surface-variant hover:text-primary transition-colors">관리자 로그인</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline-variant/10 text-center md:text-left">
          <p className="text-xs text-on-surface-variant opacity-70">© {new Date().getFullYear()} Move-In Fair Management. All rights reserved.</p>
        </div>
      </footer>

      <Modal opened={!!modal} onClose={() => setModal(null)} title={modal?.title} size="lg" centered>
        <p className="text-sm leading-7 text-on-surface-variant whitespace-pre-wrap">{modal?.body}</p>
        <button
          onClick={() => setModal(null)}
          className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-medium text-on-primary transition hover:opacity-90"
        >
          확인
        </button>
      </Modal>
    </>
  );
}
