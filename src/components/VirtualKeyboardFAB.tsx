import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, X, ChevronDown, RefreshCw, Power } from 'lucide-react';
import SimpleKeyboard, { type KeyboardReactInterface } from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

type KeyboardMode = 'english' | 'korean' | 'numbers';

const LAYOUTS: Record<KeyboardMode, object> = {
  english: {
    default: [
      'q w e r t y u i o p {bksp}',
      'a s d f g h j k l {enter}',
      '{shift} z x c v b n m , . {shift}',
      '{numbers} {space} {kor}',
    ],
    shift: [
      'Q W E R T Y U I O P {bksp}',
      'A S D F G H J K L {enter}',
      '{shift} Z X C V B N M ! ? {shift}',
      '{numbers} {space} {kor}',
    ],
  },
  korean: {
    default: [
      'ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ {bksp}',
      'ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ {enter}',
      '{shift} ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift}',
      '{numbers} {space} {eng}',
    ],
    shift: [
      'ㅃ ㅉ ㄸ ㄲ ㅆ ㅛ ㅕ ㅑ ㅒ ㅖ {bksp}',
      'ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ {enter}',
      '{shift} ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift}',
      '{numbers} {space} {eng}',
    ],
  },
  numbers: {
    default: [
      '1 2 3',
      '4 5 6',
      '7 8 9',
      '@ 0 {bksp}',
      '- _ . {enter}',
      '{eng} {space} {kor}',
    ],
  },
};

const DISPLAY: Record<string, string> = {
  '{bksp}': '⌫',
  '{enter}': '↵',
  '{shift}': '⇧',
  '{space}': '___',
  '{numbers}': '123',
  '{eng}': 'ENG',
  '{kor}': '한',
};

// 한글 조합을 위한 execCommand 기반 입력
function insertText(text: string) {
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
  // execCommand가 React controlled input과 호환됨
  document.execCommand('insertText', false, text);
}

function deleteChar() {
  document.execCommand('delete');
}

function pressEnter() {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return;
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
  el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
  // form submit 처리
  const form = el.closest('form');
  if (form) {
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  }
}

export default function VirtualKeyboardFAB() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<KeyboardMode>('korean');
  const [shift, setShift] = useState(false);
  const keyboardRef = useRef<KeyboardReactInterface | null>(null);

  // 키보드가 열릴 때 마지막 포커스 유지
  const lastFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const target = e.target as Element;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        lastFocusRef.current = target;
      }
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  const restoreFocus = useCallback(() => {
    if (lastFocusRef.current) {
      (lastFocusRef.current as HTMLElement).focus();
    }
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    restoreFocus();
    setTimeout(() => {
      if (key === '{bksp}') {
        deleteChar();
      } else if (key === '{enter}') {
        pressEnter();
      } else if (key === '{space}') {
        insertText(' ');
      } else if (key === '{shift}') {
        setShift(prev => !prev);
        return;
      } else if (key === '{numbers}') {
        setMode('numbers');
        setShift(false);
        return;
      } else if (key === '{eng}') {
        setMode('english');
        setShift(false);
        return;
      } else if (key === '{kor}') {
        setMode('korean');
        setShift(false);
        return;
      } else {
        insertText(key);
        if (shift && mode !== 'korean') setShift(false);
      }
    }, 10);
  }, [restoreFocus, shift, mode]);

  const layoutName = shift ? 'shift' : 'default';

  return (
    <>
      {/* 키보드 패널 */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-[9999] w-[min(96vw,560px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          onMouseDown={e => e.preventDefault()} // 포커스 빼앗기지 않게
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-1.5">
              {(['korean', 'english', 'numbers'] as KeyboardMode[]).map(m => (
                <button
                  key={m}
                  onMouseDown={e => { e.preventDefault(); setMode(m); setShift(false); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    mode === m ? 'text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
                  }`}
                  style={mode === m ? { backgroundColor: '#00355f' } : {}}
                >
                  {m === 'korean' ? '한글' : m === 'english' ? 'ENG' : '123'}
                </button>
              ))}
            </div>
            <button
              onMouseDown={e => { e.preventDefault(); setOpen(false); }}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* 키보드 */}
          <div className="p-2">
            <SimpleKeyboard
              keyboardRef={r => { keyboardRef.current = r; }}
              layoutName={layoutName}
              layout={LAYOUTS[mode] as Parameters<typeof SimpleKeyboard>[0]['layout']}
              display={DISPLAY}
              onKeyPress={handleKeyPress}
              theme="hg-theme-default hg-layout-default"
              physicalKeyboardHighlight={false}
              disableCaretPositioning
            />
          </div>
        </div>
      )}

      {/* 서브 메뉴 버튼들 */}
      {menuOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end gap-3">
          {/* 키보드 */}
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-lg shadow">키보드</span>
            <button
              onClick={() => { setOpen(prev => !prev); setMenuOpen(false); }}
              className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: open ? '#0f4c81' : '#00355f' }}
            >
              <Keyboard size={20} color="white" />
            </button>
          </div>
          {/* 새로고침 */}
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-lg shadow">새로고침</span>
            <button
              onClick={() => { window.location.reload(); }}
              className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-emerald-500"
            >
              <RefreshCw size={20} color="white" />
            </button>
          </div>
          {/* 화면 닫기 */}
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-lg shadow">화면 닫기</span>
            <button
              onClick={() => { window.close(); }}
              className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-red-500"
            >
              <Power size={20} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* 메인 FAB */}
      <button
        onClick={() => { setMenuOpen(prev => !prev); if (menuOpen) setOpen(false); }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: menuOpen ? '#2d3133' : '#00355f' }}
        title="메뉴"
      >
        {menuOpen ? <X size={22} color="white" /> : <Keyboard size={22} color="white" />}
      </button>
    </>
  );
}
