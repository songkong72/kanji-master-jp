const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/kanjiData.json', 'utf8'));

const phoneticsMap = {
    "나라우": "ならう",
    "호코로비루": "ほころびる",
    "하다누기": "하だぬぎ", // Fix: はだぬぎ
    "시보무": "しぼむ",
    "아자케루": "あざける",
    "무다샤베리": "むだしゃべり",
    "하카도루": "はかどる",
    "카나에": "かなえ",
    "카야": "かや",
    "네지": "ねじ",
    "토리코": "とりこ",
    "후리소데하카마": "ふりそではかま",
    "메이베츠": "めいべつ",
    "하다누기": "はだぬぎ",
    "테이다테": "ていたて", // guess
    "기": "き", // 勍 enemy part
    "온시츠": "おんしつ",
    "다레카": "だれか",
    "호코로비루": "ほころびる",
    "아자케루": "あざける",
    "하카도루": "하かどる", // fix later
    "시보무": "しぼむ",
    "무다샤베리": "む다しゃべ리", // fix later
    "무다샤베리": "むだしゃべり",
    "하카도루": "はかどる",
    "시보무": "しぼむ"
};

// Character level mapping
const charMap = {
    '아': 'あ', '이': 'い', '우': 'う', '에': 'え', '오': 'お',
    '카': 'か', '키': 'き', '쿠': 'く', '케': 'け', '코': 'こ',
    '사': 'さ', '시': 'し', '스': 'す', '세': 'せ', '소': 'そ',
    '타': 'た', '치': 'ち', '츠': 'つ', '테': 'て', '토': 'と',
    '나': 'な', '니': 'に', '누': 'ぬ', '네': 'ね', '노': 'の',
    '하': 'は', '히': 'ひ', '후': 'ふ', '헤': 'へ', '호': 'ほ',
    '마': 'ま', '미': 'み', '무': 'む', '메': 'め', '모': 'も',
    '야': 'や', '유': 'ゆ', '요': 'よ',
    '라': 'ら', '리': 'り', '루': 'る', '레': 'れ', '로': 'ろ',
    '와': 'わ', '오': 'を', '응': 'ん',
    '가': 'が', '기': 'ぎ', '구': 'ぐ', '게': 'げ', '고': 'ご',
    '자': 'ざ', '지': 'じ', '즈': 'ず', '제': 'ぜ', '조': 'ぞ',
    '다': 'だ', '지': 'ぢ', '즈': 'づ', '데': 'で', '도': 'ど',
    '바': 'ば', '비': 'び', '부': 'ぶ', '베': 'べ', '보': 'ぼ',
    '파': 'ぱ', '피': 'ぴ', '푸': 'ぷ', '페': 'ぺ', '포': 'ぽ',
    '테': 'て', '이': 'い', '키': 'き' // for け이테키 parts
};

let count = 0;
data.forEach(d => {
    let changed = false;

    // Check Examples
    if (d.examples) {
        d.examples.forEach(ex => {
            if (/[가-힣]/.test(ex.reading)) {
                const original = ex.reading;
                // Try whole word first
                if (phoneticsMap[ex.reading]) {
                    ex.reading = phoneticsMap[ex.reading];
                } else {
                    // Try char by char
                    ex.reading = ex.reading.replace(/[가-힣]/g, (c) => charMap[c] || c);
                }
                if (ex.reading !== original) {
                    console.log(`Example Reading Fix for ${d.kanji}: ${original} -> ${ex.reading}`);
                    changed = true;
                }
            }
        });
    }

    // Check Sentences
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (s && s.text && /[가-힣]/.test(s.text)) {
            const original = s.text;
            s.text = s.text.replace(/[가-힣]/g, (c) => charMap[c] || c);
            if (s.text !== original) {
                console.log(`Sentence Text Fix for ${d.kanji}: ${original} -> ${s.text}`);
                changed = true;
            }
        }
    });

    if (changed) count++;
});

// Final check for '勍'
const kyoh = data.find(k => k.kanji === '勍');
if (kyoh) {
    kyoh.examples[0].reading = "けいてき";
    kyoh.on_sentence.text = "[勍](けい)[敵](てき)에[立](た)ち[向](む)かう。".replace('에', 'に');
}

fs.writeFileSync('./src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log(`Total items fixed: ${count}`);
