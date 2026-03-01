import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, BookOpen, GraduationCap, BarChart2, Settings,
  Search, Bell, Lightbulb, ChevronLeft, ChevronRight, Bookmark, CheckCircle2, Volume2, X, RotateCcw, Medal
} from 'lucide-react'
import kanjiData from './data/kanjiData.json'
import './index.css'
import HanziWriter from 'hanzi-writer'
import APP_LOGO from './assets/logo.png'

interface KanjiExample {
  word: string
  mean: string
  reading?: string
}

interface KanjiSentence {
  text: string
  mean: string
}

interface Kanji {
  id: number
  kanji: string
  meaning: string
  on_reading: string
  kun_reading: string
  category: string
  explanation: string
  examples: KanjiExample[]
  on_sentence?: KanjiSentence
  kun_sentence?: KanjiSentence
  mnemonic_image?: string
  stroke_image?: string
}

const typedKanjiData = kanjiData as Kanji[]

const Sidebar = ({ activeTab, setActiveTab, setSelectedKanji, setQuizIndex, setQuizScore, handleLogout, setSelectedCategory, selectedCategory }: {
  activeTab: string
  setActiveTab: (tab: string) => void
  setSelectedKanji: (kanji: Kanji | null) => void
  setQuizIndex: (idx: number) => void
  setQuizScore: (score: number) => void
  handleLogout?: () => void
  setSelectedCategory: (cat: string) => void
  selectedCategory: string
}) => (
  <div className="sidebar">
    <div className="logo" onClick={() => setActiveTab('home')}>
      <img src={`${APP_LOGO}?v=2`} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
      <span>Kanji Master</span>
    </div>
    <div className="nav-links">
      <div className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setSelectedKanji(null); }}>
        <Home size={20} />
        <span>홈</span>
      </div>
      <div className={`nav-link ${activeTab === 'library' && (selectedCategory !== 'Bookmarks') ? 'active' : ''}`} onClick={() => { setActiveTab('library'); setSelectedCategory('All'); setSelectedKanji(null); }}>
        <BookOpen size={20} />
        <span>한자 사전</span>
      </div>
      <div className={`nav-link ${activeTab === 'library' && (selectedCategory === 'Bookmarks') ? 'active' : ''}`} onClick={() => { setActiveTab('library'); setSelectedCategory('Bookmarks'); setSelectedKanji(null); }}>
        <Bookmark size={20} />
        <span>북마크 한자</span>
      </div>
      <div className={`nav-link ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => { setActiveTab('quiz'); setQuizIndex(0); setQuizScore(0); }}>
        <GraduationCap size={20} />
        <span>테스트</span>
      </div>
      <div className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
        <Settings size={20} />
        <span>설정</span>
      </div>
    </div>

    <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid #F1F5F9' }}>
      {handleLogout ? (
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '12px',
            background: '#FEE2E2',
            color: '#EF4444',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          로그아웃
        </button>
      ) : (
        <button
          onClick={() => (window as unknown as Record<string, (v: boolean) => void>).setShowAuth(true)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '12px',
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          로그인 / 가입
        </button>
      )}
    </div>
  </div>
)

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isGuest, setIsGuest] = useState(true) // Start as Guest by default
  const [showAuth, setShowAuth] = useState(false) // Toggle for AuthScreen
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [authView, setAuthView] = useState('login')
  const [memorizedIds, setMemorizedIds] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem('memorizedIds') || '[]')
  )
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem('bookmarkedIds') || '[]')
  )

  const toggleMemorize = (id: number) => {
    setMemorizedIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id])
  }

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev => prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id])
  }

  useEffect(() => {
    localStorage.setItem('memorizedIds', JSON.stringify(memorizedIds))
  }, [memorizedIds])

  useEffect(() => {
    localStorage.setItem('bookmarkedIds', JSON.stringify(bookmarkedIds))
  }, [bookmarkedIds])

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFeedback, setQuizFeedback] = useState<null | 'correct' | 'wrong'>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  // Writing Mode State
  const [isWritingMode, setIsWritingMode] = useState(false)

  // Filtered kanji
  const filteredKanji = useMemo(() => {
    return typedKanjiData.filter(item => {
      const matchesSearch = item.kanji.includes(searchQuery) ||
        item.meaning.includes(searchQuery) ||
        item.on_reading.includes(searchQuery) ||
        item.kun_reading.includes(searchQuery)

      if (selectedCategory === 'All') return matchesSearch
      if (selectedCategory === 'Bookmarks') return matchesSearch && bookmarkedIds.includes(item.id)
      if (selectedCategory === 'Completed') return matchesSearch && memorizedIds.includes(item.id)

      return matchesSearch && item.category === selectedCategory
    })
  }, [searchQuery, selectedCategory, bookmarkedIds, memorizedIds])

  // Navigation
  const goToDetail = (kanji: Kanji) => {
    if (isGuest && !['N5', 'N4'].includes(kanji.category)) {
      setShowPremiumModal(true)
      return
    }
    setSelectedKanji(kanji)
    setActiveTab('detail')
  }

  const goBack = () => {
    setSelectedKanji(null)
    setActiveTab(activeTab === 'detail' ? 'library' : 'dashboard')
  }

  const goNextKanji = () => {
    if (!selectedKanji) return
    const currentIndex = filteredKanji.findIndex(k => k.id === selectedKanji.id)
    if (currentIndex < filteredKanji.length - 1) {
      setSelectedKanji(filteredKanji[currentIndex + 1])
    }
  }

  const goPrevKanji = () => {
    if (!selectedKanji) return
    const currentIndex = filteredKanji.findIndex(k => k.id === selectedKanji.id)
    if (currentIndex > 0) {
      setSelectedKanji(filteredKanji[currentIndex - 1])
    }
  }

  // Quiz Logic
  const currentQuizKanji = typedKanjiData[quizIndex % typedKanjiData.length]

  // Quiz Options - using useMemo but safely avoiding lint issues by pre-calculating values
  const quizOptions = useMemo(() => {
    const correctAnswer = currentQuizKanji.kun_reading.split(',')[0].trim()
    const options = [correctAnswer]

    let attempt = 1
    while (options.length < 4 && attempt < typedKanjiData.length) {
      const idx = (quizIndex + attempt * 7) % typedKanjiData.length
      const randomReading = typedKanjiData[idx].kun_reading.split(',')[0].trim()
      if (!options.includes(randomReading)) {
        options.push(randomReading)
      }
      attempt++
    }

    return options.sort() // Deterministic sort
  }, [quizIndex, currentQuizKanji.kun_reading])

  const handleQuizAnswer = (option: string, index: number) => {
    if (quizFeedback) return
    setSelectedOption(index)
    const isCorrect = option === currentQuizKanji.kun_reading.split(',')[0].trim()
    if (isCorrect) {
      setQuizScore(prev => prev + 10)
      setQuizFeedback('correct')
    } else {
      setQuizFeedback('wrong')
    }
  }

  const nextQuiz = () => {
    setQuizIndex(prev => prev + 1)
    setQuizFeedback(null)
    setSelectedOption(null)
  }

  // Speech Synthesis
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('이 브라우저는 음성 합성을 지원하지 않습니다.')
      return
    }

    // 진행 중인 모든 음성 중지
    window.speechSynthesis.cancel()

    // [한자](요미가나) 형식 처리: 요미가나(괄호 안)를 우선적으로 읽어 발음 정확도 향상
    let cleanText = text;
    if (text.includes('](')) {
      cleanText = text.replace(/\[.*?\]\((.*?)\)/g, '$1');
    }
    // 남은 대괄호 및 기타 소괄호 내용 정리
    cleanText = cleanText.split('[').join('').split(']').join('').replace(/\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText)

    // 한국어 포함 여부 감지하여 언어 설정
    const hasKorean = /[가-힣]/.test(cleanText);
    utterance.lang = hasKorean ? 'ko-KR' : 'ja-JP';
    utterance.rate = 0.9 // 자연스러운 학습 속도

    const performSpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) {
        // 음성 목록이 없어도 기본 설정으로 시도
        window.speechSynthesis.speak(utterance)
        return
      }

      const targetLang = hasKorean ? 'ko' : 'ja';
      // 해당 언어에 가장 적합한 목소리 찾기
      const preferredVoice = voices.find(v => v.lang.toLowerCase() === utterance.lang.toLowerCase()) ||
        voices.find(v => v.lang.toLowerCase().includes(targetLang)) ||
        voices.find(v => v.default) ||
        voices[0];

      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance)
    }

    // 음성 데이터 로딩 대기 루틴
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        performSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      }
    } else {
      performSpeak()
    }
  }

  const renderRuby = (text: string | undefined) => {
    if (!text) return null
    const parts = text.split(/(\[.*?\]\(.*?\))/g)
    return (
      <>
        {parts.map((part, i) => {
          const match = part.match(/\[(.*?)\]\((.*?)\)/)
          if (match) {
            return (
              <ruby key={i} style={{ cursor: 'pointer', padding: '0 2px' }} onClick={(e) => { e.stopPropagation(); speak(match[1]) }}>
                {match[1]}
                <rt style={{ fontSize: '0.6em', color: '#6366f1' }}>{match[2]}</rt>
              </ruby>
            )
          }
          return part
        })}
      </>
    )
  }

  // --- Writing Board Component ---
  const WritingBoard = ({ kanji, onClose }: { kanji: Kanji, onClose: () => void }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const writerRef = useRef<HanziWriter | null>(null)
    const [mode, setMode] = useState<'animate' | 'quiz'>('animate')

    useEffect(() => {
      if (!containerRef.current) return

      // Clear previous content
      containerRef.current.innerHTML = ''

      const writer = HanziWriter.create(containerRef.current, kanji.kanji, {
        width: 300,
        height: 300,
        padding: 20,
        showOutline: true,
        strokeColor: '#3B82F6',
        outlineColor: '#F1F5F9',
        drawingColor: '#3B82F6',
        drawingWidth: 15,
        showCharacter: false
      })

      writerRef.current = writer

      if (mode === 'animate') {
        writer.animateCharacter()
      } else {
        writer.quiz()
      }

      return () => {
        // Cleanup if needed
      }
    }, [kanji, mode])

    const handleAnimate = () => {
      setMode('animate')
      writerRef.current?.animateCharacter()
    }

    const handleQuiz = () => {
      setMode('quiz')
      writerRef.current?.quiz()
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="writing-board-overlay"
      >
        <div className="writing-board-container" style={{ maxWidth: '400px' }}>
          <div className="board-header">
            <h3>{kanji.kanji} 쓰기 연습</h3>
            <button className="close-btn" onClick={onClose}><X size={24} /></button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', background: '#F8FAFC', padding: '1rem' }}>
            <div ref={containerRef} style={{ background: 'white', borderRadius: '16px', border: '4px solid #F1F5F9' }}></div>
          </div>

          <div className="board-controls" style={{ padding: '1rem', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={mode === 'animate' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '0.75rem' }}
                onClick={handleAnimate}
              >
                <RotateCcw size={18} style={{ marginRight: '0.5rem' }} />
                획순 보기
              </button>
              <button
                className={mode === 'quiz' ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, padding: '0.75rem' }}
                onClick={handleQuiz}
              >
                <GraduationCap size={18} style={{ marginRight: '0.5rem' }} />
                직접 쓰기
              </button>
            </div>
            <button className="btn-primary" onClick={onClose} style={{ width: '100%', background: '#1E293B' }}>
              연습 완료
            </button>
          </div>
        </div>
      </motion.div>
    )
  }
  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsGuest(true)
    setActiveTab('home')
  }

  // Set global function for sidebar to access
  useEffect(() => {
    (window as unknown as Record<string, (v: boolean) => void>).setShowAuth = setShowAuth;
  }, []);

  // --- Auth Screen Component ---
  const AuthScreen = () => (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="auth-logo-section">
          <img src={`${APP_LOGO}?v=2`} alt="App Logo" className="auth-app-logo" style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover', marginBottom: '1rem' }} />
          <h1>한자 마스터 JP</h1>
          <p>일본어 한자 정복의 시작, 함께해요.</p>
        </div>

        <div className="auth-form">
          <div className="input-group-premium">
            <label>이메일</label>
            <input type="email" placeholder="example@email.com" />
          </div>
          <div className="input-group-premium">
            <label>비밀번호</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <button className="login-btn-premium" onClick={() => setIsLoggedIn(true)}>
            로그인
          </button>
        </div>

        <div className="auth-divider">
          <span>또는</span>
        </div>

        <div className="social-auth-group">
          <button className="social-btn google">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Google로 시작하기
          </button>
          <button className="social-btn apple">
            <svg viewBox="0 0 384 512" width="18"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
            Apple로 시작하기
          </button>

          <div className="auth-divider" style={{ margin: '1rem 0' }}>
            <span>또는</span>
          </div>

          <button className="guest-btn-premium" onClick={() => { setIsLoggedIn(false); setIsGuest(true); setShowAuth(false); }}>
            로그인 없이 그냥 공부하기 (체약판)
          </button>
        </div>

        <div className="auth-footer" onClick={() => setAuthView(authView === 'login' ? 'signup' : 'login')}>
          {authView === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
          <span>{authView === 'login' ? '회원가입' : '로그인'}</span>
        </div>

        <button
          onClick={() => setShowAuth(false)}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
        >
          <X size={24} />
        </button>
      </motion.div>
    </div>
  )

  // --- Ad Banner Component ---
  const AdBanner = () => (
    <div className="ad-banner-container">
      <div className="ad-content">
        <span className="ad-badge">AD</span>
        <p>전세계 1위 일본어 학습 앱, <b>한자 마스터 PRO</b>로 광고 없이 공부하세요! 💎</p>
      </div>
      <button className="ad-action-btn" onClick={() => setShowAuth(true)}>광고 제거</button>
    </div>
  )
  // --- Sakura Particle Component ---
  const SakuraParticles = () => (
    <div className="sakura-container">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 12}s`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  )

  // Memorization toggle
  return (
    <div className="app-container">
      <SakuraParticles />
      <div className="layout-wrapper">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSelectedKanji={setSelectedKanji}
          setQuizIndex={setQuizIndex}
          setQuizScore={setQuizScore}
          handleLogout={isLoggedIn ? handleLogout : undefined}
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        <main className="main-content">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="home">
                <div className="header-row">
                  <div className="welcome-text">
                    <h1>ようこそ! 🌸 환영합니다</h1>
                    <p>{isGuest ? 'N5 기초 한자를 무료로 학습해 보세요.' : '모든 JLPT 단계를 자유롭게 학습하실 수 있습니다.'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Bell size={24} color="#94A3B8" />
                    {!isGuest && <div className="inkan-badge">学</div>}
                    {isGuest && (
                      <div style={{ background: 'var(--japan-gold)', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => setShowAuth(true)}>PRO 가입</div>
                    )}
                  </div>
                </div>

                <div className="dashboard-grid">
                  <div className="card today-kanji-card">
                    <div className="big-kanji">{typedKanjiData[quizIndex % typedKanjiData.length].kanji}</div>
                    <div className="kanji-brief">
                      <span style={{ color: 'var(--japan-gold)', fontWeight: 700, fontSize: '0.8rem' }}>오늘의 추천 한자</span>
                      <div className="meaning-sound-group">
                        <span className="main-meaning">{typedKanjiData[quizIndex % typedKanjiData.length].meaning.split(' ')[0]}</span>
                        <span className="main-sound">{typedKanjiData[quizIndex % typedKanjiData.length].meaning.split(' ')[1]}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="readings-mini">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            On: {typedKanjiData[quizIndex % typedKanjiData.length].on_reading}
                            <Volume2 size={12} className="mini-speak" onClick={(e) => { e.stopPropagation(); speak(typedKanjiData[quizIndex % typedKanjiData.length].on_reading); }} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Kun: {typedKanjiData[quizIndex % typedKanjiData.length].kun_reading}
                            <Volume2 size={12} className="mini-speak" onClick={(e) => { e.stopPropagation(); speak(typedKanjiData[quizIndex % typedKanjiData.length].kun_reading); }} />
                          </div>
                        </div>
                        <button className="speak-btn" onClick={() => speak(typedKanjiData[quizIndex % typedKanjiData.length].kanji)}>
                          <Volume2 size={18} />
                        </button>
                      </div>
                      <button className="btn-primary" onClick={() => goToDetail(typedKanjiData[quizIndex % typedKanjiData.length])}>지금 학습하기</button>
                    </div>
                  </div>

                  <div className="card">
                    <h3>주간 학습 포인트</h3>
                    <div style={{ height: '140px', background: '#0F172A', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem' }}>
                      {[20, 50, 35, quizScore, 65, 30, 50].map((h, i) => (
                        <div key={i} style={{ width: '12px', height: `${Math.min(h, 100)}%`, background: i === 3 ? 'var(--japan-gold)' : '#334155', borderRadius: '4px', transition: 'height 0.5s' }}></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="jlpt-attainment">
                  <h3>학습 진척도</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="progress-item">
                      <div className="progress-header"><span>N5 한자</span><span>{Math.round((memorizedIds.filter(id => typedKanjiData.find(k => k.id === id)?.category === 'N5').length / typedKanjiData.filter(k => k.category === 'N5').length) * 100)}%</span></div>
                      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(memorizedIds.filter(id => typedKanjiData.find(k => k.id === id)?.category === 'N5').length / typedKanjiData.filter(k => k.category === 'N5').length) * 100}%`, transition: 'width 0.5s' }}></div></div>
                    </div>
                    <div className="progress-item">
                      <div className="progress-header"><span>N4 한자</span><span>{Math.round((memorizedIds.filter(id => typedKanjiData.find(k => k.id === id)?.category === 'N4').length / Math.max(1, typedKanjiData.filter(k => k.category === 'N4').length)) * 100)}%</span></div>
                      <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(memorizedIds.filter(id => typedKanjiData.find(k => k.id === id)?.category === 'N4').length / Math.max(1, typedKanjiData.filter(k => k.category === 'N4').length)) * 100}%`, transition: 'width 0.5s', background: 'var(--japan-gold)' }}></div></div>
                    </div>
                  </div>
                </div>

                <div className="recent-study" style={{ marginTop: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>최근 본 한자</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--japan-gold)', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActiveTab('library')}>전체보기</span>
                  </div>
                  <div className="recent-grid">
                    {[...typedKanjiData.filter(k => k.category === 'N5').slice(0, 3), ...typedKanjiData.filter(k => k.category === 'N4').slice(0, 3)].map(k => (
                      <motion.div
                        key={k.id}
                        className="recent-item"
                        onClick={() => goToDetail(k)}
                        whileHover={{ y: -5 }}
                      >
                        <div className="recent-kanji">{k.kanji}</div>
                        <div className="recent-meaning">{k.meaning.split(' ')[1]}</div>
                        <div style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: '2px' }}>
                          {memorizedIds.includes(k.id) && <CheckCircle2 size={12} color="#10B981" />}
                          {bookmarkedIds.includes(k.id) && <Bookmark size={12} color="var(--japan-vermilion)" fill="var(--japan-vermilion)" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bookmark-section" style={{ marginTop: '2.5rem', paddingBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>나의 북마크 🔖</h3>
                    <span
                      style={{ fontSize: '0.8rem', color: 'var(--japan-vermilion)', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => { setActiveTab('library'); setSelectedCategory('Bookmarks'); }}
                    >
                      모두 보기
                    </span>
                  </div>
                  {bookmarkedIds.length > 0 ? (
                    <div className="recent-grid">
                      {typedKanjiData.filter(k => bookmarkedIds.includes(k.id)).slice(0, 6).map(k => (
                        <motion.div
                          key={k.id}
                          className="recent-item"
                          onClick={() => goToDetail(k)}
                          whileHover={{ y: -5 }}
                          style={{ borderColor: 'rgba(188, 54, 45, 0.2)' }}
                        >
                          <div className="recent-kanji" style={{ color: 'var(--japan-vermilion)' }}>{k.kanji}</div>
                          <div className="recent-meaning">{k.meaning.split(' ')[1]}</div>
                          <Bookmark size={12} color="var(--japan-vermilion)" fill="var(--japan-vermilion)" style={{ position: 'absolute', top: 5, right: 5 }} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-color)' }}>
                      <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>아직 북마크한 한자가 없어요. <br /> 다시 외우고 싶은 한자에 리본 🔖 아이콘을 눌러보세요!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="library">
                <div className="library-header-row">
                  <div className="library-title-group">
                    <h1>한자 마스터 라이브러리</h1>
                    <p>오늘 공부할 새로운 한자를 찾아보세요.</p>
                  </div>

                  <div className="search-box-premium">
                    <div className="search-icon-inside">
                      <Search size={22} />
                    </div>
                    <input
                      type="text"
                      placeholder="한자, 뜻, 독음으로 검색..."
                      className="search-input-premium"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="search-shortcut-hint">
                      ESC
                    </div>
                  </div>
                </div>
                <div className="category-filter-dynamic">
                  {['All', 'N5', 'N4', 'N3', 'N2', 'N1'].map(cat => (
                    <motion.button
                      key={cat}
                      className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                      whileTap={{ scale: 0.95 }}
                      style={{ position: 'relative' }}
                    >
                      {selectedCategory === cat && (
                        <motion.div
                          layoutId="active-pill"
                          className="active-pill"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span style={{ position: 'relative', zIndex: 2 }}>{cat}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="kanji-grid">
                  {filteredKanji.map(k => (
                    <motion.div
                      key={k.id}
                      className="kanji-item-card"
                      onClick={() => goToDetail(k)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="item-kanji">{k.kanji}</div>
                      <div className="item-meaning-group">
                        <span className="item-meaning-text">{k.meaning.split(' ')[0]}</span>
                        <span className="item-sound-text">{k.meaning.split(' ')[1]}</span>
                      </div>
                      <div className="item-readings">{k.on_reading} / {k.kun_reading}</div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {memorizedIds.includes(k.id) && <CheckCircle2 size={16} color="#10B981" />}
                        {bookmarkedIds.includes(k.id) && <Bookmark size={16} color="var(--japan-vermilion)" fill="var(--japan-vermilion)" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'detail' && selectedKanji && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} key="detail">
                <div className="detail-header">
                  <motion.div
                    className="back-button-premium"
                    onClick={goBack}
                    whileHover={{ x: -6 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    title="라이브러리로 돌아가기"
                  >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                  </motion.div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="speak-btn"
                      onClick={goPrevKanji}
                      disabled={filteredKanji.findIndex(k => k.id === selectedKanji.id) === 0}
                      style={{ opacity: filteredKanji.findIndex(k => k.id === selectedKanji.id) === 0 ? 0.3 : 1 }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="speak-btn"
                      onClick={goNextKanji}
                      disabled={filteredKanji.findIndex(k => k.id === selectedKanji.id) === filteredKanji.length - 1}
                      style={{ opacity: filteredKanji.findIndex(k => k.id === selectedKanji.id) === filteredKanji.length - 1 ? 0.3 : 1 }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="detail-layout">
                  <div className="kanji-focus">
                    <motion.div
                      className="display"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      style={{ position: 'relative', overflow: 'hidden' }}
                    >
                      {selectedKanji.stroke_image ? (
                        <img
                          src={selectedKanji.stroke_image}
                          alt="stroke order"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        selectedKanji.kanji
                      )}
                      <button className="speak-btn" style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }} onClick={() => speak(selectedKanji.kanji)}>
                        <Volume2 size={24} />
                      </button>
                    </motion.div>
                    <button className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setIsWritingMode(true)}>
                      <GraduationCap size={20} />
                      쓰기 연습 (Beta)
                    </button>
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <div style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          width: '100%',
                          textAlign: 'center',
                          color: selectedKanji.category === 'N5' ? '#34D399' :
                            selectedKanji.category === 'N4' ? '#60A5FA' :
                              selectedKanji.category === 'N3' ? '#FBBF24' :
                                selectedKanji.category === 'N2' ? '#FB923C' :
                                  selectedKanji.category === 'N1' ? '#F87171' : '#A78BFA',
                          background: selectedKanji.category === 'N5' ? 'rgba(52, 211, 153, 0.1)' :
                            selectedKanji.category === 'N4' ? 'rgba(96, 165, 250, 0.1)' :
                              selectedKanji.category === 'N3' ? 'rgba(251, 191, 36, 0.1)' :
                                selectedKanji.category === 'N2' ? 'rgba(251, 146, 60, 0.1)' :
                                  selectedKanji.category === 'N1' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(167, 139, 250, 0.1)',
                          border: `1px solid ${selectedKanji.category === 'N5' ? 'rgba(52, 211, 153, 0.2)' :
                            selectedKanji.category === 'N4' ? 'rgba(96, 165, 250, 0.2)' :
                              selectedKanji.category === 'N3' ? 'rgba(251, 191, 36, 0.2)' :
                                selectedKanji.category === 'N2' ? 'rgba(251, 146, 60, 0.2)' :
                                  selectedKanji.category === 'N1' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`
                        }}>
                          JLPT {selectedKanji.category}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <div style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          width: '100%',
                          textAlign: 'center',
                          color: memorizedIds.includes(selectedKanji.id) ? '#10B981' : '#60A5FA',
                          background: memorizedIds.includes(selectedKanji.id) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(96, 165, 250, 0.1)',
                          border: `1px solid ${memorizedIds.includes(selectedKanji.id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(96, 165, 250, 0.2)'}`
                        }}>
                          {memorizedIds.includes(selectedKanji.id) ? '학습 완료' : '학습 진행 중'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-cards-stack">
                    <div className="card" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '2rem' }}>{selectedKanji.meaning}</h2>
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                          <Medal
                            size={28}
                            color={memorizedIds.includes(selectedKanji.id) ? "var(--japan-gold)" : "#CBD5E1"}
                            fill={memorizedIds.includes(selectedKanji.id) ? "var(--japan-gold)" : "none"}
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleMemorize(selectedKanji.id)}
                          />
                          <Bookmark
                            size={28}
                            color={bookmarkedIds.includes(selectedKanji.id) ? "var(--japan-vermilion)" : "#CBD5E1"}
                            fill={bookmarkedIds.includes(selectedKanji.id) ? "var(--japan-vermilion)" : "none"}
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleBookmark(selectedKanji.id)}
                          />
                        </div>
                      </div>
                      <div className="info-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="section-title"><BookOpen size={18} /><span>읽기 정보</span></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              음독 (중국식)
                              <Volume2 size={14} style={{ cursor: 'pointer' }} onClick={() => speak(selectedKanji.on_reading)} />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--japan-vermilion)', marginBottom: '0.5rem' }}>{selectedKanji.on_reading}</div>
                            {selectedKanji.on_sentence && (
                              <div className="sentence-box">
                                <span className="sentence-japanese">{renderRuby(selectedKanji.on_sentence.text)}</span>
                                <span className="sentence-meaning">{selectedKanji.on_sentence.mean}</span>
                                <button className="sentence-play-btn" onClick={() => speak(selectedKanji.on_sentence?.text || '')}>
                                  <Volume2 size={14} /> 발음 듣기
                                </button>
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              훈독 (일본식)
                              <Volume2 size={14} style={{ cursor: 'pointer' }} onClick={() => speak(selectedKanji.kun_reading)} />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--japan-matcha)', marginBottom: '0.5rem' }}>{selectedKanji.kun_reading}</div>
                            {selectedKanji.kun_sentence && (
                              <div className="sentence-box">
                                <span className="sentence-japanese">{renderRuby(selectedKanji.kun_sentence.text)}</span>
                                <span className="sentence-meaning">{selectedKanji.kun_sentence.mean}</span>
                                <button className="sentence-play-btn" onClick={() => speak(selectedKanji.kun_sentence?.text || '')}>
                                  <Volume2 size={14} /> 발음 듣기
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="memory-helper">
                      <div className="helper-title">
                        <Lightbulb size={18} />
                        <span>디자인실장 영자의 암기 팁! 💡</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {selectedKanji.mnemonic_image && (
                          <div style={{ flexShrink: 0, width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #CCFBF1' }}>
                            <img
                              src={selectedKanji.mnemonic_image}
                              alt="mnemonic"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--japan-matcha)', fontSize: '1rem', flex: 1 }}>
                          {selectedKanji.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="card" style={{ borderRadius: '24px' }}>
                      <div className="section-title"><GraduationCap size={18} /><span>실전 활용 단어</span></div>
                      <div className="word-list" style={{ marginTop: '1rem' }}>
                        {selectedKanji.examples.map((ex, idx) => (
                          <div key={idx} className="word-row" style={{ boxShadow: 'none', borderBottom: '1px solid #1E293B', borderRadius: 0, padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="word-japanese" style={{ fontSize: '1.2rem' }}>
                                {renderRuby(ex.reading ? `[${ex.word}](${ex.reading})` : ex.word)}
                              </span>
                              <span className="word-korean" style={{ fontWeight: 600 }}>{ex.mean}</span>
                            </div>
                            <button className="speak-btn" onClick={() => speak(ex.word)}>
                              <Volume2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ background: memorizedIds.includes(selectedKanji.id) ? '#10B981' : '#3B82F6', padding: '1.2rem', fontSize: '1.1rem' }}
                      onClick={() => toggleMemorize(selectedKanji.id)}
                    >
                      {memorizedIds.includes(selectedKanji.id) ? '학습 취소' : '학습 완료 체크! 🎉'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="quiz" className="quiz-container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 700 }}>
                    <span>오늘의 챌린지 🎯</span>
                    <span>현재 점수: {quizScore}점</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '12px' }}><div className="progress-bar-fill" style={{ width: `${(quizIndex % 10) * 10}%`, background: '#3B82F6' }}></div></div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                  >
                    <div className="quiz-q-kanji" style={{ background: quizFeedback === 'correct' ? 'rgba(52, 211, 153, 0.15)' : quizFeedback === 'wrong' ? 'rgba(248, 113, 113, 0.15)' : undefined, transition: 'background 0.3s' }}>
                      {currentQuizKanji.kanji}
                    </div>
                    <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontWeight: 800 }}>이 한자의 올바른 훈독은?</h2>

                    <div className="quiz-options">
                      {quizOptions.map((opt, i) => (
                        <button
                          key={i}
                          className={`quiz-opt-btn ${selectedOption === i ? (quizFeedback === 'correct' ? 'correct' : 'wrong') : ''}`}
                          onClick={() => handleQuizAnswer(opt, i)}
                        >
                          <span style={{ fontWeight: 800, color: '#94A3B8', marginRight: '0.5rem' }}>{String.fromCharCode(65 + i)}</span>
                          <span style={{ fontWeight: 700 }}>{opt}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '4rem' }}>
                  <button className="btn-primary" style={{ background: '#1E293B', color: '#94A3B8' }} onClick={nextQuiz}>건너뛰기</button>
                  <button className="btn-primary" style={{ width: '220px' }} onClick={nextQuiz} disabled={!quizFeedback}>
                    {quizFeedback ? '다음 문제로 ✨' : '정답을 선택하세요!'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <div style={{ textAlign: 'center', marginTop: '8rem' }}>
                <BarChart2 size={80} color="var(--japan-gold)" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                <h2 style={{ fontWeight: 800 }}>학습 통계 준비 중!</h2>
                <p style={{ color: '#94A3B8' }}>대표님이 얼마나 열심히 공부하셨는지 저 영자가 곧 정리해 드릴게요! 📊✨</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ textAlign: 'center', marginTop: '8rem' }}>
                <Settings size={80} color="#94A3B8" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                <h2 style={{ fontWeight: 800 }}>설정 및 개인화</h2>
                <p style={{ color: '#94A3B8' }}>알림 설정과 테마 변경 기능을 준비 중입니다. 🌈</p>
              </div>
            )}

          </AnimatePresence>
        </main>

        {isGuest && <AdBanner />}

        <AnimatePresence>
          {isWritingMode && selectedKanji && (
            <WritingBoard kanji={selectedKanji} onClose={() => setIsWritingMode(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAuth && (
            <AuthScreen />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPremiumModal && (
            <div className="premium-modal-overlay">
              <motion.div
                className="premium-modal-card"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="premium-icon-badge">PRO</div>
                <h2>어머, 이건 PRO 전용이에요! 💎</h2>
                <p>현재 N5 단계는 무료로 제공되지만, <br /><strong>N4 ~ N1 단계</strong> 학습은 로그인이 필요합니다.</p>

                <div className="premium-benefit-list">
                  <div className="benefit-item">✨ 모든 JLPT 레벨(N1-N5) 무제한 이용</div>
                  <div className="benefit-item">📊 학습 데이터 평생 보관 및 동기화</div>
                  <div className="benefit-item">🚫 거추장스러운 광고 완전 제거</div>
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: '1.2rem', marginTop: '1.5rem' }} onClick={() => { setShowPremiumModal(false); setIsLoggedIn(false); setIsGuest(false); }}>
                  지금 가입하고 혜택 받기
                </button>
                <button className="btn-secondary" style={{ width: '100%', marginTop: '0.8rem', border: 'none' }} onClick={() => setShowPremiumModal(false)}>
                  나중에 할게요
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

