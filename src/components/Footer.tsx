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
    <footer className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold mb-3">ReserveTicket</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              성공적인 입주 박람회를 위한 최고의 선택, ReserveTicket과 함께하세요.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">바로가기</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">홈</Link></li>
              <li><Link to="/events" className="text-gray-400 hover:text-white text-sm transition-colors">박람회 목록</Link></li>
              <li><Link to="/my-tickets" className="text-gray-400 hover:text-white text-sm transition-colors">내 예약 확인</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">회사정보</h4>
            <ul className="space-y-1">
              <li className="text-gray-400 text-sm">{companyInfo.name || '이든씨엔에스 주식회사'}</li>
              <li className="text-gray-400 text-sm">{companyInfo.address || '경기도 수원시 영통구'}</li>
              <li className="text-gray-400 text-sm">{companyInfo.email || 'edencns1999@naver.com'}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">법적 고지</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setModalContent({ title: '이용약관', body: TERMS_CONTENT })}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  이용약관
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModalContent({ title: '개인정보처리방침', body: PRIVACY_CONTENT })}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  개인정보처리방침
                </button>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">
                  관리자 로그인
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ReserveTicket. All rights reserved.
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
        <p className="text-sm text-gray-500 whitespace-pre-wrap">{modalContent?.body}</p>
        <button
          onClick={() => setModalContent(null)}
          className="w-full mt-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity bg-blue-600"
        >
          확인
        </button>
      </Modal>
    </footer>
  );
}
