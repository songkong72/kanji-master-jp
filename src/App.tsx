import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, BookOpen, GraduationCap, BarChart2, Settings,
  Search, Bell, Lightbulb, ChevronLeft, ChevronRight, Bookmark, CheckCircle2, Volume2, X, RotateCcw, Medal, Pencil, List
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
  on_sentence?: KanjiSentence | KanjiSentence[]
  kun_sentence?: KanjiSentence | KanjiSentence[]
  mnemonic_image?: string
  stroke_image?: string
  subcategory?: string
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
        <span>단어장</span>
      </div>
      <div className={`nav-link ${activeTab === 'library' && (selectedCategory === 'Bookmarks') ? 'active' : ''}`} onClick={() => { setActiveTab('library'); setSelectedCategory('Bookmarks'); setSelectedKanji(null); }}>
        <Bookmark size={20} />
        <span>북마크</span>
      </div>
      <div className={`nav-link ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => { setActiveTab('quiz'); setQuizIndex(0); setQuizScore(0); }}>
        <GraduationCap size={20} />
        <span>퀴즈</span>
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
            background: 'var(--japan-gold)',
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
  const [selectedSubcategory, setSelectedSubcategory] = useState('전체')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
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

      const matchesCategory = item.category === selectedCategory
      if (selectedSubcategory === '전체') return matchesSearch && matchesCategory
      return matchesSearch && matchesCategory && item.subcategory === selectedSubcategory
    })
  }, [searchQuery, selectedCategory, selectedSubcategory, bookmarkedIds, memorizedIds])

  // Navigation
  const goToDetail = (kanji: Kanji) => {
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

  const renderRuby = (text: string | undefined, targetKanji?: string, highlightColor?: string) => {
    if (!text) return null
    const parts = text.split(/(\[.*?\]\(.*?\))/g)
    const color = highlightColor || 'var(--japan-vermilion)'

    // Extract kana string helpers
    const kataToHira = (str: string) => str.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60))

    const generateMutations = (reading: string): string[] => {
      const muts = new Set([reading])
      const rendakuMap: Record<string, string> = {
        'か': 'が', 'き': 'ぎ', 'く': 'ぐ', 'け': 'げ', 'こ': 'ご',
        'さ': 'ざ', 'し': 'じ', 'す': 'ず', 'せ': 'ぜ', 'そ': 'ぞ',
        'た': 'だ', 'ち': 'ぢ', 'つ': 'づ', 'て': 'で', 'と': 'ど',
        'は': 'ば', 'ひ': 'び', 'ふ': 'ぶ', 'へ': 'べ', 'ほ': 'ぼ'
      }
      const handakuMap: Record<string, string> = {
        'は': 'ぱ', 'ひ': 'ぴ', 'ふ': 'ぷ', 'へ': 'ぺ', 'ほ': 'ぽ'
      }

      if (reading.length > 1) {
        const lastChar = reading[reading.length - 1]
        // Sokuon mutations
        if (['つ', 'く', 'ち', 'き'].includes(lastChar)) {
          muts.add(reading.slice(0, -1) + 'っ')
        }
        // Cho-on/Length mutations (sometimes omitted in compound)
        if (['う', 'い'].includes(lastChar)) {
          muts.add(reading.slice(0, -1))
        }
      }

      if (reading.length > 0) {
        const firstChar = reading[0]
        if (rendakuMap[firstChar]) muts.add(rendakuMap[firstChar] + reading.slice(1))
        if (handakuMap[firstChar]) muts.add(handakuMap[firstChar] + reading.slice(1))
      }

      if (reading.length > 1) {
        const firstChar = reading[0]
        const lastChar = reading[reading.length - 1]
        if (['つ', 'く', 'ち', 'き'].includes(lastChar)) {
          if (rendakuMap[firstChar]) muts.add(rendakuMap[firstChar] + reading.slice(1, -1) + 'っ')
          if (handakuMap[firstChar]) muts.add(handakuMap[firstChar] + reading.slice(1, -1) + 'っ')
        }
      }
      return Array.from(muts)
    }

    let readings: string[] = []
    if (targetKanji && selectedKanji && selectedKanji.kanji === targetKanji) {
      const k = selectedKanji;
      const splitRegex = new RegExp('[,/]');
      const onR = k.on_reading && k.on_reading !== '-' ? k.on_reading.split(splitRegex).map(r => r.trim()) : []
      const kunR = k.kun_reading && k.kun_reading !== '-' ? k.kun_reading.split(splitRegex).flatMap(r => {
        const cleaned = r.trim();
        return cleaned.includes('.') ? [cleaned.split('.')[0], cleaned.replace(/\./g, '')] : [cleaned];
      }) : []
      const baseReadings = [...onR.map(kataToHira), ...kunR.map(kataToHira)].filter(r => r)
      readings = baseReadings.flatMap(generateMutations)
      // Sort by length descending to match longest possible string first
      readings.sort((a, b) => b.length - a.length)
    }

    return (
      <>
        {parts.map((part, i) => {
          const match = part.match(/\[(.*?)\]\((.*?)\)/)
          if (match) {
            const isTarget = targetKanji && match[1].includes(targetKanji)
            let rtContent: React.ReactNode = match[2]

            if (isTarget && readings.length > 0) {
              const kIndex = match[1].indexOf(targetKanji)
              const isStart = kIndex === 0
              const isEnd = kIndex === match[1].length - 1

              let matchedReading = null
              let startIndex = -1

              for (const r of readings) {
                if (isStart && match[2].startsWith(r)) {
                  matchedReading = r; startIndex = 0; break;
                } else if (isEnd && match[2].endsWith(r)) {
                  matchedReading = r; startIndex = match[2].length - r.length; break;
                } else if (!isStart && !isEnd && match[2].includes(r)) {
                  matchedReading = r; startIndex = match[2].indexOf(r); break;
                }
              }

              if (matchedReading && startIndex !== -1) {
                const before = match[2].slice(0, startIndex)
                const active = match[2].slice(startIndex, startIndex + matchedReading.length)
                const after = match[2].slice(startIndex + matchedReading.length)
                rtContent = (
                  <>
                    {before}
                    <span style={{ color: color, fontWeight: 700, opacity: 1 }}>{active}</span>
                    {after}
                  </>
                )
              }
            }

            return (
              <ruby
                key={i}
                className={isTarget ? "target-ruby" : ""}
                style={{
                  cursor: 'pointer',
                  padding: '0 2px',
                  marginRight: '2px'
                }}
                onClick={(e) => { e.stopPropagation(); speak(text) }}
              >
                {match[1].split('').map((char, charIdx) => {
                  const isCharTarget = targetKanji && char === targetKanji;
                  return (
                    <span key={charIdx} style={{
                      color: isCharTarget ? color : 'inherit',
                      fontWeight: isCharTarget ? 700 : 'normal'
                    }}>
                      {char}
                    </span>
                  );
                })}
                <rt style={{
                  fontSize: '0.6em',
                  color: 'var(--text-secondary)',
                  fontWeight: 'normal',
                  opacity: 0.9
                }}>
                  {rtContent}
                </rt>
              </ruby>
            )
          }
          return <span key={i} style={{ opacity: 0.9 }}>{part}</span>
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
      >
        <div className="auth-logo-section">
          <img src={APP_LOGO} alt="App Logo" className="auth-app-logo" style={{ width: '80px', height: '80px', borderRadius: '20px', marginBottom: '1rem' }} />
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

          <button className="login-btn-premium" onClick={() => { setIsLoggedIn(true); setIsGuest(false); setShowAuth(false); }}>
            로그인
          </button>
        </div>

        <div className="social-auth-group">
          <button className="guest-btn-premium" style={{ marginTop: '1rem' }} onClick={() => { setIsLoggedIn(false); setIsGuest(true); setShowAuth(false); }}>
            로그인 없이 계속하기
          </button>
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
        <p><b>한자 마스터 PRO</b>로 광고 없이 쾌적하게 공부하세요! 💎</p>
      </div>
      <button className="ad-action-btn" onClick={() => setShowAuth(true)}>PRO 가입</button>
    </div>
  )
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="home" className="tab-content">

                <div className="sticky-header-wrapper">
                  <div className="header-row">
                    <div className="welcome-text">
                      <h1>ようこそ! 🌸 환영합니다</h1>
                      <p>{isGuest ? 'N5부터 N1까지, 광고와 함께 무료로 학습해 보세요!' : 'PRO 회원님, 모든 단계를 광고 없이 즐겨보세요! ✨'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Bell size={24} color="#94A3B8" />
                      {!isGuest && <div className="inkan-badge">学</div>}
                      {isGuest && (
                        <div style={{ background: 'var(--japan-gold)', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => setShowAuth(true)}>PRO 가입</div>
                      )}
                    </div>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => {
                      const totalInLevel = typedKanjiData.filter(k => k.category === level).length;
                      const memorizedInLevel = memorizedIds.filter(id => typedKanjiData.find(k => k.id === id)?.category === level).length;
                      const progress = totalInLevel > 0 ? Math.round((memorizedInLevel / totalInLevel) * 100) : 0;
                      return (
                        <div key={level} className="progress-item">
                          <div className="progress-header">
                            <span>{level} 한자</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${progress}%`,
                                transition: 'width 0.8s ease-out',
                                background: level === 'N5' ? 'var(--japan-crimson)' :
                                  level === 'N4' ? 'var(--japan-gold)' :
                                    level === 'N3' ? 'var(--japan-indigo)' :
                                      level === 'N2' ? 'var(--japan-vermilion)' :
                                        '#334155'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="recent-study" style={{ marginTop: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>최근 본 한자</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--japan-gold)', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActiveTab('library')}>전체보기</span>
                  </div>
                  <div className="recent-grid">
                    {[
                      ...typedKanjiData.filter(k => k.category === 'N5').slice(0, 2),
                      ...typedKanjiData.filter(k => k.category === 'N4').slice(0, 2),
                      ...typedKanjiData.filter(k => k.category === 'N3').slice(0, 2),
                      ...typedKanjiData.filter(k => k.category === 'N2').slice(0, 1),
                      ...typedKanjiData.filter(k => k.category === 'N1').slice(0, 1)
                    ].map(k => (
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="library" className="tab-content">

                <div className="library-sticky-header-container">
                  <div className="library-header-row">
                    <div className="library-title-group">
                      <h1>한자 마스터 라이브러리 (v1.2.1)</h1>
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
                    {['All', 'N5', 'N4', 'N3', 'N2', 'N1'].map(cat => {
                      const count = cat === 'All' ? typedKanjiData.length : typedKanjiData.filter(k => k.category === cat).length
                      return (
                        <motion.button
                          key={cat}
                          className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => { setSelectedCategory(cat); setSelectedSubcategory('전체'); }}
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
                          <span style={{ position: 'relative', zIndex: 2 }}>
                            {cat} <span className="filter-count">{count}</span>
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>

                  {selectedCategory === 'N5' && (
                    <motion.div
                      className="subcategory-filter"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {['전체', '숫자·수량', '시간·달력', '자연·날씨', '사람·가족', '인체', '위치·방향', '크기·형용', '학교·학습', '동작·이동', '사회·장소'].map(sub => {
                        const cnt = sub === '전체'
                          ? typedKanjiData.filter(k => k.category === 'N5').length
                          : typedKanjiData.filter(k => k.category === 'N5' && k.subcategory === sub).length
                        return (
                          <button
                            key={sub}
                            className={`subcategory-tab ${selectedSubcategory === sub ? 'active' : ''}`}
                            onClick={() => setSelectedSubcategory(sub)}
                          >
                            {sub === '숫자·수량' ? '🔢 숫자' :
                              sub === '시간·달력' ? '🕐 시간' :
                                sub === '자연·날씨' ? '🌿 자연' :
                                  sub === '사람·가족' ? '👨‍👩‍👧 가족' :
                                    sub === '인체' ? '🫀 인체' :
                                      sub === '위치·방향' ? '🧭 위치' :
                                        sub === '크기·형용' ? '📐 형용' :
                                          sub === '학교·학습' ? '📚 학습' :
                                            sub === '동작·이동' ? '🏃 동작' :
                                              sub === '사회·장소' ? '🏢 사회' : sub}
                            <span className="subcategory-count">{cnt}</span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}

                  {selectedCategory === 'N4' && (
                    <motion.div
                      className="subcategory-filter"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {['전체', '활동/동작', '생활/주거', '교통/이동', '신체/의류', '자연/날씨', '관계/사회', '학습/시험', '상태/성질', '위치/방향', '주의/혼동'].map(sub => {
                        const cnt = sub === '전체'
                          ? typedKanjiData.filter(k => k.category === 'N4').length
                          : typedKanjiData.filter(k => k.category === 'N4' && k.subcategory === sub).length
                        return (
                          <button
                            key={sub}
                            className={`subcategory-tab ${selectedSubcategory === sub ? 'active' : ''}`}
                            onClick={() => setSelectedSubcategory(sub)}
                          >
                            {sub === '활동/동작' ? '🏃 동작' :
                              sub === '생활/주거' ? '🏠 생활' :
                                sub === '교통/이동' ? '🚗 교통' :
                                  sub === '신체/의류' ? '👕 신체' :
                                    sub === '자연/날씨' ? '🌤️ 자연' :
                                      sub === '관계/사회' ? '🤝 사회' :
                                        sub === '학습/시험' ? '📖 학습' :
                                          sub === '상태/성질' ? '✨ 성질' :
                                            sub === '위치/방향' ? '📍 위치' :
                                              sub === '주의/혼동' ? '⚠️ 혼동' : sub}
                            <span className="subcategory-count">{cnt}</span>
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
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
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} key="detail" className="detail-page">

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
                  <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', letterSpacing: '-0.02em', opacity: 0.9 }}>
                    한자 상세 정보
                  </div>
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
                      {/* 쓰기 연습 버튼을 아이콘으로 오른쪽 상단에 배치 */}
                      <button
                        className="speak-btn"
                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
                        onClick={() => setIsWritingMode(true)}
                        title="쓰기 연습 (Beta)"
                      >
                        <Pencil size={24} />
                      </button>

                      <button className="speak-btn" style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }} onClick={() => speak(selectedKanji.kanji)}>
                        <Volume2 size={24} />
                      </button>
                    </motion.div>
                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      {/* JLPT 카드 */}
                      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                        <GraduationCap size={20} color="var(--primary-blue)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>JLPT</span>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: selectedKanji.category === 'N5' ? '#34D399' :
                            selectedKanji.category === 'N4' ? '#60A5FA' :
                              selectedKanji.category === 'N3' ? '#FBBF24' :
                                selectedKanji.category === 'N2' ? '#FB923C' : '#F87171'
                        }}>
                          {selectedKanji.category}
                        </span>
                      </div>

                      {/* 획수 카드 */}
                      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                        <Pencil size={18} color="var(--japan-gold)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>획수</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {/* JSON 데이터에 stroke_count가 있다면 사용, 없으면 예시로 4획 (실제 데이터에 맞게 조정 필요) */}
                          {(selectedKanji as any).stroke_count || '?'}획
                        </span>
                      </div>

                      {/* 부수 카드 */}
                      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                        <List size={20} color="var(--japan-vermilion)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>부수</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--kanji-font)' }}>
                          {(selectedKanji as any).radical || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-cards-stack">
                    <div className="card" style={{ border: 'none', background: 'transparent', padding: '1.25rem 0 0 1.25rem' }}>
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
                      <div className="info-box" style={{ background: 'transparent', border: 'none', padding: 0, borderRadius: 0 }}>
                        {(() => {
                          const onSents = selectedKanji.on_sentence ? (Array.isArray(selectedKanji.on_sentence) ? selectedKanji.on_sentence : [selectedKanji.on_sentence]).filter(s => s.text && s.text !== '-') : [];
                          const kunSents = selectedKanji.kun_sentence ? (Array.isArray(selectedKanji.kun_sentence) ? selectedKanji.kun_sentence : [selectedKanji.kun_sentence]).filter(s => s.text && s.text !== '-') : [];
                          const examples = selectedKanji.examples || [];

                          // Filter examples that contain specific labels
                          const onExamples = examples.filter(ex => ex.mean.includes('(음독)'));
                          const kunExamples = examples.filter(ex => ex.mean.includes('(훈독)'));
                          const generalExamples = examples.filter(ex => !ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)'));

                          const meaningText = selectedKanji.meaning.split(' ')[0] || '';

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              {/* Onyomi Section */}
                              <div className="reading-section">
                                <div className="reading-section-title onyomi">
                                  음독 (Onyomi)
                                </div>
                                <div className="reading-content-card onyomi">
                                  <div className="reading-main-display" style={{ color: 'var(--japan-vermilion)' }}>
                                    {selectedKanji.on_reading}
                                    <Volume2 size={20} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => speak(selectedKanji.on_reading)} />
                                  </div>

                                  {(onSents.length > 0 || onExamples.length > 0) && (
                                    <div className="mini-word-list">
                                      {onExamples.map((ex, idx) => (
                                        <div key={`onex-${idx}`} className="mini-word-item">
                                          <div className="mini-word-left">
                                            <span className="mini-word-jp">{renderRuby(ex.word, selectedKanji.kanji, 'var(--japan-vermilion)')}</span>
                                            <span className="mini-word-mean">{ex.mean.replace('(음독)', '').trim()}</span>
                                          </div>
                                          <button className="mini-word-play" onClick={() => speak(ex.word)}>
                                            <Volume2 size={16} />
                                          </button>
                                        </div>
                                      ))}
                                      {onSents.map((sent, idx) => (
                                        <div key={`onst-${idx}`} className="mini-word-item">
                                          <div className="mini-word-left">
                                            <span className="mini-word-jp" style={{ fontSize: '1.1rem' }}>{renderRuby(sent.text, selectedKanji.kanji, 'var(--japan-vermilion)')}</span>
                                            <span className="mini-word-mean">{sent.mean}</span>
                                          </div>
                                          <button className="mini-word-play" onClick={() => speak(sent.text)}>
                                            <Volume2 size={16} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Kunyomi Section */}
                              <div className="reading-section">
                                <div className="reading-section-title kunyomi">
                                  훈독 (Kunyomi)
                                </div>
                                <div className="reading-content-card kunyomi">
                                  <div className="reading-main-display" style={{ color: 'var(--japan-matcha)' }}>
                                    {selectedKanji.kun_reading}
                                    <Volume2 size={20} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => speak(selectedKanji.kun_reading)} />
                                  </div>

                                  {(kunSents.length > 0 || kunExamples.length > 0) && (
                                    <div className="mini-word-list">
                                      {kunExamples.map((ex, idx) => (
                                        <div key={`kunex-${idx}`} className="mini-word-item">
                                          <div className="mini-word-left">
                                            <span className="mini-word-jp">{renderRuby(ex.word, selectedKanji.kanji, 'var(--japan-matcha)')}</span>
                                            <span className="mini-word-mean">{ex.mean.replace('(훈독)', '').trim()}</span>
                                          </div>
                                          <button className="mini-word-play" onClick={() => speak(ex.word)}>
                                            <Volume2 size={16} />
                                          </button>
                                        </div>
                                      ))}
                                      {kunSents.map((sent, idx) => (
                                        <div key={`kunst-${idx}`} className="mini-word-item">
                                          <div className="mini-word-left">
                                            <span className="mini-word-jp" style={{ fontSize: '1.1rem' }}>{renderRuby(sent.text, selectedKanji.kanji, 'var(--japan-matcha)')}</span>
                                            <span className="mini-word-mean">{sent.mean}</span>
                                          </div>
                                          <button className="mini-word-play" onClick={() => speak(sent.text)}>
                                            <Volume2 size={16} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })()}
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
                                {renderRuby(
                                  ex.word.includes('[') ? ex.word : (ex.reading ? `[${ex.word}](${ex.reading})` : ex.word),
                                  selectedKanji.kanji,
                                  ex.mean.includes('음독') ? 'var(--japan-vermilion)' : 'var(--japan-matcha)'
                                )}
                              </span>
                              <span className="word-korean" style={{ fontWeight: 600 }}>{ex.mean}</span>
                            </div>
                            <button className="speak-btn" onClick={() => speak(ex.reading || ex.word)}>
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
                      {memorizedIds.includes(selectedKanji.id) ? '학습 취소' : '학습 완료'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="quiz" className="tab-content quiz-container">

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
          {showAuth && (
            <AuthScreen />
          )}
          {isWritingMode && selectedKanji && (
            <WritingBoard kanji={selectedKanji} onClose={() => setIsWritingMode(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

