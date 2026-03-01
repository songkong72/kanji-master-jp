---
description: 한자 데이터를 추가하거나 수정할 때 준수해야 할 데이터 품질 지침
---

# 한자 데이터 품질 지침 (Kanji Data Quality Guidelines)

한자 데이터(`src/data/kanjiData.json`)를 추가하거나 수정할 때 반드시 아래 규칙을 준수해야 합니다.

---

## 🚨 긴급 작업: 예문 품질 보강 (현재 진행 중)

### 현황 (2026-03-02 기준)
- **전체 한자**: 900개 (N5~N1)
- **한글 혼입 예문**: 0개 (제거 완료 ✅)
- **양호한 예문**: 185개 (ID 1~100 범위에 집중)
- **부실한 예문**: 1615개 — `[漢字](読み)。` 같은 단어 수준의 짧은 조각
- **완료율**: 약 10% (185/1800)

### 해야 할 작업
**ID 101~900 범위의 한자 예문(`on_sentence`, `kun_sentence`)을 완전한 일본어 문장으로 교체해야 합니다.**

현재 상태에서 대부분의 예문이 `[社](しゃ)。` 또는 `[銀行](ぎんこう)。` 처럼 단어 하나만 남은 형태입니다.
이것을 `[会社](かいしゃ)に[勤](つと)める。` 같은 자연스러운 일본어 문장으로 교체해야 합니다.

### 작업 방법
1. **배치 100개씩 작업**: Python 스크립트를 사용해 100개 단위로 수정합니다.
2. **파일 위치**: `src/data/kanjiData.json`
3. **스크립트 패턴**: 아래 Python 스크립트 템플릿을 참고하세요.

```python
"""
배치 수정 스크립트 템플릿
"""
import json

with open('src/data/kanjiData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixes = {
    # ID: {"on_sentence": {"text": "일본어 문장", "mean": "한국어 번역"},
    #       "kun_sentence": {"text": "일본어 문장", "mean": "한국어 번역"}}
    101: {
        "on_sentence": {"text": "[書店](しょてん)で[本](ほん)を[買](か)う。", "mean": "서점에서 책을 산다."},
        "kun_sentence": {"text": "あの[店](みせ)は[美味](おい)しい。", "mean": "저 가게는 맛있다."}
    },
    # ... 나머지 한자들을 여기에 추가
}

for item in data:
    if item['id'] in fixes:
        fix = fixes[item['id']]
        if 'on_sentence' in fix:
            item['on_sentence'] = fix['on_sentence']
        if 'kun_sentence' in fix:
            item['kun_sentence'] = fix['kun_sentence']

with open('src/data/kanjiData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
```

### 작업 우선순위
| 우선순위 | ID 범위 | JLPT | 상태 |
|---------|---------|------|------|
| ✅ 완료 | 1~100 | N5 | 양호 |
| 1순위 | 101~200 | N5/N4 | 부실 → 수정 필요 |
| 2순위 | 201~400 | N4/N3 | 부실 → 수정 필요 |
| 3순위 | 401~600 | N3/N2 | 부실 → 수정 필요 |
| 4순위 | 601~800 | N2/N1 | 부실 → 수정 필요 |
| 5순위 | 801~900 | N1 | 부실 → 수정 필요 |

### 검증 스크립트
작업 후 아래 명령어로 품질을 확인합니다:
```bash
python -c "
import json, re
with open('src/data/kanjiData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
korean_re = re.compile('[가-힣]+')
good=0; short=0; korean=0
for item in data:
    for field in ['on_sentence', 'kun_sentence']:
        if field not in item or not item[field]: continue
        text = item[field].get('text', '')
        clean = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text)
        if korean_re.search(text): korean += 1
        elif len(clean) <= 5: short += 1
        else: good += 1
print(f'양호: {good}, 부실: {short}, 한글혼입: {korean}')
print(f'완료율: {good}/{good+short+korean} ({good*100//(good+short+korean)}%)')
"
```

### 완료된 작업 참고 파일
- `C:/Users/sejun/.gemini/antigravity/tmp/fix_korean_in_sentences.py` — 한글 제거 스크립트
- `C:/Users/sejun/.gemini/antigravity/tmp/fix_n5_sentences.py` — ID 1~100 예문 수정 (성공)
- ID 1~20은 수동 고품질 예문, ID 21~100은 배치 스크립트로 수정 완료

---

## 🔴 필수 규칙 (MUST)

### 1. 예문(on_sentence, kun_sentence)은 반드시 일본어로 작성
- **예문의 `text` 필드는 반드시 일본어(일본어 한자 + 히라가나/카타카나)로만 작성해야 합니다.**
- 한글이 절대 섞이면 안 됩니다.
- **`mean` 필드만 한국어 번역**으로 작성합니다.

#### ❌ 잘못된 예시
```json
"on_sentence": {
    "text": "[虹](こう) 예(무지개).",
    "mean": "무지개(홍예)."
},
"kun_sentence": {
    "text": "일곱 빛깔 [虹](にじ).",
    "mean": "일곱 색깔 무지개(니지)."
}
```

#### ✅ 올바른 예시
```json
"on_sentence": {
    "text": "[虹](こう)が[空](そら)に[架](か)かった。",
    "mean": "무지개가 하늘에 걸렸다."
},
"kun_sentence": {
    "text": "きれいな[虹](にじ)が[見](み)えた。",
    "mean": "예쁜 무지개가 보였다."
}
```

### 2. on_sentence는 음독(ON), kun_sentence는 훈독(KUN)을 사용해야 함
- **`on_sentence`의 문장에는 반드시 해당 한자의 음독(on_reading) 발음이 포함되어야 합니다.**
- **`kun_sentence`의 문장에는 반드시 해당 한자의 훈독(kun_reading) 발음이 포함되어야 합니다.**
- 음독 예문에 훈독을 쓰거나, 훈독 예문에 음독을 쓰면 안 됩니다.

#### ❌ 잘못된 예: 한자 「食」(음독: ショク, 훈독: た.べる)
```json
"on_sentence": {"text": "[食](た)べる。"}  ← 음독 예문에 훈독(た)을 씀!
```

#### ✅ 올바른 예:
```json
"on_sentence": {"text": "[食事](しょくじ)をする。"},  ← 음독(ショク) 사용 ✅
"kun_sentence": {"text": "ご[飯](はん)を[食](た)べる。"}  ← 훈독(た) 사용 ✅
```

### 3. 예문은 JLPT 또는 실생활에서 빈번한 발음 기준으로 작성
- 각 한자의 음독(on_reading)과 훈독(kun_reading)별로 JLPT 시험에 자주 출제되거나 실생활에서 빈번히 사용되는 발음을 우선적으로 예문에 포함합니다.
- 예문은 해당 발음이 자연스럽게 사용되는 **완전한 일본어 문장**이어야 합니다.
- **단어 하나만 쓰면 안 됩니다.** 최소 주어+동사 또는 목적어+동사 구조의 문장이어야 합니다.
- **문법적으로 올바른 일본어**여야 합니다. 조사(は、が、を、に、で 등)를 올바르게 사용하세요.

#### ❌ 부실한 예문 (이런 형태는 안 됨)
```json
"on_sentence": {"text": "[社](しゃ)。", "mean": "사장님 취임."}
```

#### ✅ 올바른 예문 (자연스러운 문장)
```json
"on_sentence": {"text": "[会社](かいしゃ)に[勤](つと)める。", "mean": "회사에 근무한다."}
```

### 3. 루비 표기(후리가나) 형식
- 한자에 읽기를 붙일 때는 `[漢字](よみがな)` 형식을 사용합니다.
- 예: `[食](た)べる`, `[学校](がっこう)`
- 빈 괄호 `[漢字]()` 형태는 금지. 반드시 읽기를 넣어야 합니다.

### 4. 데이터 구조
각 한자 항목은 다음 필드를 포함해야 합니다:
```json
{
    "id": 1,
    "kanji": "一",
    "meaning": "한 일",               // 한국어 의미 + 한자 훈
    "on_reading": "イチ, イツ",        // 음독 (카타카나)
    "kun_reading": "ひと(つ)",         // 훈독 (히라가나)
    "category": "N5",                 // JLPT 레벨 (N5~N1)
    "explanation": "...",             // 한국어 암기 팁
    "examples": [                     // 활용 단어 목록
        {
            "word": "一つ",
            "mean": "하나",           // 한국어 뜻
            "reading": "ひとつ"       // 히라가나 읽기
        }
    ],
    "on_sentence": {                  // 음독 예문 (⚠️ 반드시 일본어!)
        "text": "...",                // 일본어 문장 (한글 금지!)
        "mean": "..."                // 한국어 번역
    },
    "kun_sentence": {                 // 훈독 예문 (⚠️ 반드시 일본어!)
        "text": "...",                // 일본어 문장 (한글 금지!)
        "mean": "..."                // 한국어 번역
    }
}
```

### 5. examples의 mean은 한국어, word는 일본어
- `examples[].word`: 일본어 단어 (한자 또는 한자+가나 혼합)
- `examples[].mean`: 한국어 뜻
- `examples[].reading`: 히라가나 읽기

### 6. 한자 추가 시 필수 사항
- 일본 상용한자 2136자를 목표로 데이터를 확장 중입니다.
- 현재 900개 등록 완료. N2, N1 한자를 지속적으로 추가해야 합니다.
- 새 한자 추가 시에도 위의 모든 규칙을 준수해야 합니다.

### 7. 서브카테고리(subcategory) 분류 — 의미별 주제 분류

각 JLPT 레벨 안에서 한자를 **의미별 주제(テーマ別)**로 서브카테고리로 나눕니다.
`subcategory` 필드를 각 한자 데이터에 추가해야 합니다.

#### 현황 (2026-03-02 기준)
| JLPT | subcategory 적용 | 상태 |
|------|------------------|------|
| N5 | ✅ 완료 (116개) | 10개 서브카테고리 |
| N4 | ❌ 미적용 | 작업 필요 |
| N3 | ❌ 미적용 | 작업 필요 |
| N2 | ❌ 미적용 | 작업 필요 |
| N1 | ❌ 미적용 | 작업 필요 |

#### N5 서브카테고리 (참고 기준)
N5에 적용된 10개 서브카테고리입니다. N4~N1에도 동일한 카테고리를 기본으로 사용하되, 해당 레벨에만 있는 주제가 있으면 추가합니다.

| 서브카테고리 | 이모지 | 설명 | N5 예시 |
|-------------|--------|------|---------|
| 숫자·수량 | 🔢 | 수, 양, 화폐 | 一、二、百、千 |
| 시간·달력 | 🕐 | 시간, 날짜, 요일 | 日、時、月、年 |
| 자연·날씨 | 🌿 | 자연물, 기후, 식물 | 山、川、雨、花 |
| 사람·가족 | 👨‍👩‍👧 | 가족, 인간관계 | 父、母、兄、友 |
| 인체 | 🫀 | 신체, 건강, 기력 | 目、口、手、体 |
| 위치·방향 | 🧭 | 공간, 방위 | 上、下、東、西 |
| 크기·형용 | 📐 | 색상, 크기, 형태 | 大、白、高、新 |
| 학교·학습 | 📚 | 교육, 언어, 독서 | 学、読、書、話 |
| 동작·이동 | 🏃 | 행위, 움직임 | 行、来、食、飲 |
| 사회·장소 | 🏢 | 시설, 교통, 국가 | 駅、店、社、国 |

#### 작업 방법
1. 해당 JLPT 레벨의 모든 한자를 확인한다.
2. 각 한자를 의미에 맞는 서브카테고리에 분류한다.
3. Python 스크립트로 `subcategory` 필드를 추가한다.
4. UI에 서브카테고리 필터를 추가한다 (N5 참고: `App.tsx`의 `subcategory-filter` 코드).

```python
# 서브카테고리 추가 스크립트 템플릿
import json

with open('src/data/kanjiData.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

subcategory_map = {
    # ID: "서브카테고리명"
    201: "동작·이동",
    202: "사람·가족",
    # ...
}

for item in data:
    if item['id'] in subcategory_map:
        item['subcategory'] = subcategory_map[item['id']]

with open('src/data/kanjiData.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
```

5. UI 수정: `App.tsx`에서 해당 JLPT 레벨 선택 시 서브카테고리 필터가 나타나도록 조건을 추가한다.
```tsx
// N5만 적용된 현재 코드:
{selectedCategory === 'N5' && ( <SubcategoryFilter /> )}

// N4도 추가할 경우:
{(selectedCategory === 'N5' || selectedCategory === 'N4') && ( <SubcategoryFilter /> )}
```

#### 분류 원칙
- 한 한자는 **하나의 서브카테고리에만** 속해야 합니다 (중복 불가).
- 여러 의미를 가진 한자는 **가장 대표적인 의미** 기준으로 분류합니다.
- 어디에도 맞지 않으면 "기타" 카테고리를 사용할 수 있습니다.
- N4~N1에서 새로운 주제가 필요하면 (예: "감정·심리", "법률·정치") 추가할 수 있습니다.

---

## 📋 체크리스트
데이터 추가/수정 시 아래를 확인하세요:
- [ ] `on_sentence.text`에 한글이 없는가? (일본어만 사용)
- [ ] `kun_sentence.text`에 한글이 없는가? (일본어만 사용)
- [ ] 예문이 단어가 아닌 **완전한 문장**인가? (최소 5자 이상)
- [ ] `on_sentence.mean`, `kun_sentence.mean`에 한국어 번역이 있는가?
- [ ] 루비 표기가 `[漢字](よみがな)` 형식인가? (빈 괄호 없는가?)
- [ ] 예문이 JLPT/실생활에 유용한 문장인가?
- [ ] 카테고리가 올바른 JLPT 레벨인가? (N5, N4, N3, N2, N1)
- [ ] `subcategory` 필드가 있는가? (의미별 주제 분류)
- [ ] 작업 후 검증 스크립트를 실행했는가?

## ⚠️ 주의 사항
- Python 스크립트 작성 시 JSON 문자열 안에 일본어 따옴표(「」)나 특수문자 사용에 주의
- `json.dump` 시 `ensure_ascii=False` 필수
- 배치 작업 후 반드시 검증 스크립트로 품질 확인
- 모든 답변은 한글로 해야 함 (사용자 요청)
