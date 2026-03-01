import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, BookOpen, GraduationCap, BarChart2, Settings,
  Search, Bell, Lightbulb, ChevronLeft, ChevronRight, Bookmark, CheckCircle2, Volume2
} from 'lucide-react'
import kanjiData from './data/kanjiData.json'
import './index.css'

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

const Sidebar = ({ activeTab, setActiveTab, setSelectedKanji, setQuizIndex, setQuizScore }: {
  activeTab: string
  setActiveTab: (tab: string) => void
  setSelectedKanji: (kanji: Kanji | null) => void
  setQuizIndex: (idx: number) => void
  setQuizScore: (score: number) => void
}) => (
  <div className="sidebar">
    <div className="logo">
      <span style={{ fontSize: '1.5rem' }}>🉐</span>
      <span>Kanji Master</span>
    </div>
    <div className="nav-links">
      <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSelectedKanji(null); }}>
        <Home size={20} />
        <span>홈</span>
      </div>
      <div className={`nav-link ${activeTab === 'library' || activeTab === 'detail' ? 'active' : ''}`} onClick={() => { setActiveTab('library'); setSelectedKanji(null); }}>
        <BookOpen size={20} />
        <span>한자 사전</span>
      </div>
      <div className={`nav-link ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => { setActiveTab('quiz'); setQuizIndex(0); setQuizScore(0); }}>
        <GraduationCap size={20} />
        <span>테스트</span>
      </div>
      <div className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
        <BarChart2 size={20} />
        <span>학습 현황</span>
      </div>
    </div>
    <div style={{ marginTop: 'auto' }}>
      <div className="nav-link" onClick={() => setActiveTab('settings')}>
        <Settings size={20} />
        <span>설정</span>
      </div>
    </div>
  </div>
)

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [memorizedIds, setMemorizedIds] = useState<number[]>([])

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizFeedback, setQuizFeedback] = useState<null | 'correct' | 'wrong'>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  // Filtered kanji
  const filteredKanji = useMemo(() => {
    return typedKanjiData.filter(item => {
      const matchesSearch = item.kanji.includes(searchQuery) || item.meaning.includes(searchQuery)
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

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

    const cleanText = text.replace(/\[|\]|\(.*?\)/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.9 // 학습을 위해 약간 천천히

    const loadAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      const jaVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'))
      if (jaVoice) utterance.voice = jaVoice
      window.speechSynthesis.speak(utterance)
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        loadAndSpeak()
        window.speechSynthesis.onvoiceschanged = null // 한 번만 실행
      }
    } else {
      loadAndSpeak()
    }
  }

  const renderRuby = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <ruby key={i}>
            {match[1]} <rt style={{ fontSize: '0.65em', color: '#3B82F6' }}>{match[2]}</rt>
          </ruby>
        );
      }
      return part;
    });
  }

  // Memorization toggle
  const toggleMemorize = (id: number) => {
    setMemorizedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="layout-wrapper">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedKanji={setSelectedKanji}
        setQuizIndex={setQuizIndex}
        setQuizScore={setQuizScore}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">

          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="dashboard">
              <div className="header-row">
                <div className="welcome-text">
                  <h1>환영합니다, 대표님! ✨</h1>
                  <p>오늘 학습할 한자가 {typedKanjiData.length - memorizedIds.length}개 남았습니다.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Bell size={24} color="#94A3B8" />
                  <div style={{ background: '#3B82F6', color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>PRO</div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="card today-kanji-card">
                  <div className="big-kanji">{typedKanjiData[quizIndex % typedKanjiData.length].kanji}</div>
                  <div className="kanji-brief">
                    <span style={{ color: '#3B82F6', fontWeight: 700, fontSize: '0.8rem' }}>오늘의 추천 한자</span>
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
                  <div style={{ height: '140px', background: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '1rem' }}>
                    {[20, 50, 35, quizScore, 65, 30, 50].map((h, i) => (
                      <div key={i} style={{ width: '12px', height: `${Math.min(h, 100)}%`, background: i === 3 ? '#3B82F6' : '#E2E8F0', borderRadius: '4px', transition: 'height 0.5s' }}></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="jlpt-attainment">
                <h3>학습 진척도</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="progress-item">
                    <div className="progress-header"><span>N5 기초 한자</span><span>{Math.round((memorizedIds.length / typedKanjiData.length) * 100)}%</span></div>
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(memorizedIds.length / typedKanjiData.length) * 100}%`, transition: 'width 0.5s' }}></div></div>
                  </div>
                  <div className="progress-item">
                    <div className="progress-header"><span>퀴즈 평균 점수</span><span>{quizScore}점</span></div>
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${quizScore}%`, background: '#10B981' }}></div></div>
                  </div>
                </div>
              </div>

              <div className="recent-study" style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>최근 본 한자</h3>
                  <span style={{ fontSize: '0.8rem', color: '#3B82F6', cursor: 'pointer', fontWeight: 700 }}>전체보기</span>
                </div>
                <div className="recent-grid">
                  {typedKanjiData.slice(0, 6).map(k => (
                    <motion.div
                      key={k.id}
                      className="recent-item"
                      onClick={() => goToDetail(k)}
                      whileHover={{ y: -5 }}
                    >
                      <div className="recent-kanji">{k.kanji}</div>
                      <div className="recent-meaning">{k.meaning.split(' ')[1]}</div>
                      {memorizedIds.includes(k.id) && <CheckCircle2 size={12} color="#10B981" style={{ position: 'absolute', top: 5, right: 5 }} />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="library">
              <div className="header-row">
                <h1>한자 사전</h1>
                <div className="search-wrapper" style={{ width: '300px' }}>
                  <Search size={18} color="#94A3B8" />
                  <input type="text" placeholder="검색 또는 한자 입력..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="category-filter">
                {['All', 'N5', 'N4', 'N3', 'N2', 'N1'].map(cat => (
                  <button
                    key={cat}
                    className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
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
                    {memorizedIds.includes(k.id) && <CheckCircle2 size={16} color="#10B981" style={{ marginTop: '0.5rem' }} />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'detail' && selectedKanji && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} key="detail">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="back-button" onClick={goBack}>
                  <ChevronLeft size={20} />
                  <span>라이브러리</span>
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
                    <button className="speak-btn" style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }} onClick={() => speak(selectedKanji.kanji)}>
                      <Volume2 size={24} />
                    </button>
                  </motion.div>
                  <button className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <GraduationCap size={20} />
                    쓰기 연습 (Beta)
                  </button>
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <div className="card" style={{ padding: '0.75rem 1.5rem', borderRadius: '15px', flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>난이도</div>
                      <div style={{ fontWeight: 800 }}>{selectedKanji.category}</div>
                    </div>
                    <div className="card" style={{ padding: '0.75rem 1.5rem', borderRadius: '15px', flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>상태</div>
                      <div style={{ fontWeight: 800, color: memorizedIds.includes(selectedKanji.id) ? '#10B981' : '#94A3B8' }}>
                        {memorizedIds.includes(selectedKanji.id) ? '완료' : '학습중'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-cards-stack">
                  <div className="card" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h2 style={{ margin: 0, fontSize: '2rem' }}>{selectedKanji.meaning}</h2>
                      <Bookmark
                        size={28}
                        color={memorizedIds.includes(selectedKanji.id) ? "#3B82F6" : "#CBD5E1"}
                        fill={memorizedIds.includes(selectedKanji.id) ? "#3B82F6" : "none"}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleMemorize(selectedKanji.id)}
                      />
                    </div>
                    <div className="info-box" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div className="section-title"><BookOpen size={18} /><span>읽기 정보</span></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            음독 (중국식)
                            <Volume2 size={14} style={{ cursor: 'pointer' }} onClick={() => speak(selectedKanji.on_reading)} />
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444', marginBottom: '0.5rem' }}>{selectedKanji.on_reading}</div>
                          {selectedKanji.on_sentence && (
                            <div className="sentence-box">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span className="sentence-japanese">{renderRuby(selectedKanji.on_sentence.text)}</span>
                                <Volume2 size={14} className="mini-speak" onClick={() => speak(selectedKanji.on_sentence?.text || '')} />
                              </div>
                              <span className="sentence-meaning">{selectedKanji.on_sentence.mean}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            훈독 (일본식)
                            <Volume2 size={14} style={{ cursor: 'pointer' }} onClick={() => speak(selectedKanji.kun_reading)} />
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem' }}>{selectedKanji.kun_reading}</div>
                          {selectedKanji.kun_sentence && (
                            <div className="sentence-box">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span className="sentence-japanese">{renderRuby(selectedKanji.kun_sentence.text)}</span>
                                <Volume2 size={14} className="mini-speak" onClick={() => speak(selectedKanji.kun_sentence?.text || '')} />
                              </div>
                              <span className="sentence-meaning">{selectedKanji.kun_sentence.mean}</span>
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
                      <p style={{ margin: 0, lineHeight: 1.7, color: '#0F766E', fontSize: '1rem', flex: 1 }}>
                        {selectedKanji.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="card" style={{ borderRadius: '24px' }}>
                    <div className="section-title"><GraduationCap size={18} /><span>실전 활용 단어</span></div>
                    <div className="word-list" style={{ marginTop: '1rem' }}>
                      {selectedKanji.examples.map((ex, idx) => (
                        <div key={idx} className="word-row" style={{ boxShadow: 'none', borderBottom: '1px solid #F1F5F9', borderRadius: 0, padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  <div className="quiz-q-kanji" style={{ background: quizFeedback === 'correct' ? '#D1FAE5' : quizFeedback === 'wrong' ? '#FEE2E2' : '#EFF6FF', transition: 'background 0.3s' }}>
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
                <button className="btn-primary" style={{ background: '#F1F5F9', color: '#64748B' }} onClick={nextQuiz}>건너뛰기</button>
                <button className="btn-primary" style={{ width: '220px' }} onClick={nextQuiz} disabled={!quizFeedback}>
                  {quizFeedback ? '다음 문제로 ✨' : '정답을 선택하세요!'}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <div style={{ textAlign: 'center', marginTop: '8rem' }}>
              <BarChart2 size={80} color="#3B82F6" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
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
    </div>
  )
}

export default App
