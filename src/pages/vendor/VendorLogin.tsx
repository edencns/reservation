import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { vendorLogin } from '../../utils/storage';

export default function VendorLogin() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendorLogin(loginId.trim(), password);
    if (vendor) {
      navigate('/vendor/dashboard');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#667EEA' }}>
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">업체 포털</h1>
          <p className="text-sm text-gray-400 mt-1">계약 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">아이디</label>
            <input
              type="text"
              value={loginId}
              onChange={e => { setLoginId(e.target.value); setError(''); }}
              placeholder="업체 아이디 입력"
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!loginId.trim() || !password}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#667EEA' }}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
