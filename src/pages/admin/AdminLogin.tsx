import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Eye, EyeOff } from 'lucide-react';
import { adminLogin, isAdminLoggedIn } from '../../utils/storage';

const SAVE_ID_KEY = 'savedLoginId';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => localStorage.getItem(SAVE_ID_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saveId, setSaveId] = useState(() => !!localStorage.getItem(SAVE_ID_KEY));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) navigate('/admin/dashboard');
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (saveId) localStorage.setItem(SAVE_ID_KEY, username);
    else localStorage.removeItem(SAVE_ID_KEY);

    setLoading(true);
    setError('');

    try {
      const result = await adminLogin(username, password);
      if (result.ok) {
        navigate('/admin/dashboard');
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#667EEA' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#E0D6F9' }}>
            <Ticket size={32} style={{ color: '#667EEA' }} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">관리자 로그인</h1>
          <p className="text-sm text-gray-500 mt-1">ReserveTicket 관리자 전용</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">아이디</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="아이디 입력"
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667EEA] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667EEA] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveId"
              checked={saveId}
              onChange={e => setSaveId(e.target.checked)}
              className="w-4 h-4 rounded accent-[#667EEA] cursor-pointer"
            />
            <label htmlFor="saveId" className="text-sm text-gray-500 cursor-pointer select-none">아이디 저장</label>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#667EEA' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          ReserveTicket 관리자만 이용 가능합니다
        </p>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← 메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}
