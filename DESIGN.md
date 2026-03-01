# 🉐 일본어 한자 마스터 - 디자인 가이드 (DESIGN.md)

이 문서는 **Stitch MCP 전문가 영자**가 작성한 디자인 시스템 문서예요! 🎨✨
대표님의 앱이 항상 프리미엄한 감각을 유지할 수 있도록 핵심 디자인 규칙을 정리했답니다. 😉💖

---

## 🎨 1. 컬러 시스템 (Color Tokens)

Stitch의 'Kanji Interactive Quiz Mode' 테마를 기반으로 한 메인 컬러 팔레트예요!

| 용도 | 색상 코드 | 느낌 |
| :--- | :--- | :--- |
| **Primary (Brand Blue)** | `#3B82F6` | 신뢰감 있고 깨끗한 학습 분위기 |
| **Secondary (Soft Blue)** | `#EFF6FF` | 편안한 배경 및 강조 보조색 |
| **Accent (Error/On)** | `#EF4444` | 음독 및 오답 강조 |
| **Accent (Success/Kun)** | `#10B981` | 훈독 및 정답 강조 |
| **Background (Main)** | `#FFFFFF` | 가장 깨끗한 학습 환경 |
| **Background (Sidebar)** | `#F9FAFB` | 정보 구분을 위한 부드러운 그레이 |
| **Text (Title)** | `#1F2937` | 무게감 있는 고딕 텍스트 |
| **Text (Muted)** | `#6B7280` | 부드러운 설명 텍스트 |

---

## 🅰️ 2. 타이포그래피 (Typography)

*   **한국어 (UI)**: `Pretendard` - 가독성이 가장 뛰어난 모던한 고딕체예요!
*   **일본어 (Kanji)**: `Noto Sans JP` - 한자의 획순과 형태가 가장 예쁘게 보여요!
*   **English (Brand)**: `Lexend` - Stitch에서 추천한 세련된 폰트랍니다.

---

## 📐 3. 레이아웃 및 간격 (Layout & Spacing)

*   **Sidebar**: `240px` 고정. 학습 리스트와 도우미가 위치하는 전략적 공간이에요.
*   **Grid**: 리스트 뷰에서는 **2열 그리드**를 기본으로 사용해요.
*   **Radius**: 모든 카드는 `24px` 혹은 `32px`의 둥근 모서리를 가져요. (Stitch의 Roundness 가이드!)
*   **Shadow**: 부드럽고 얇은 `shadow-sm`과 강조를 위한 `shadow-md`를 섞어 써요.

---

## ✨ 4. 인터랙션 가이드 (Animations)

*   **Floating**: 상세 페이지 한자는 위아래로 살짝 떠다니는 애니메이션을 줘서 생동감을 더해요! 🎈
*   **Transition**: 탭 전환 시에는 `framer-motion`을 써서 부드럽게 스르륵 이동하게 만들 거예요~
*   **Micro-feedback**: 버튼을 누르면 살짝 작아졌다가 커지는 반응형 느낌! (Scale down on tap)

---

## 🚀 5. 향후 확장성

저 영자가 이 가이드를 바탕으로 **검색 페이지**, **학습 통계**, **필기 연습** 화면까지 같은 톤앤매너로 뚝딱 구현해 드릴게요! 🌈✨

*"대표님, 이 문서만 있으면 우리 앱은 언제나 최고로 예쁠 거예요! 믿고 맡겨주세요~!"* 💖
