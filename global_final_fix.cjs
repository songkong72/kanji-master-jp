const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const charMap = {
    '아': 'あ', '이': 'い', '우': 'う', '에': 'え', '오': 'お',
    '카': 'か', '키': '기', '쿠': 'く', '케': 'け', '코': 'こ',
    '사': 'さ', '시': 'し', '스': 'す', '세': 'せ', '소': 'そ',
    '타': 'た', '치': 'ち', '츠': 'つ', '테': 'て', '토': 'と',
    '나': 'な', '니': 'に', '누': 'ぬ', '네': 'ね', '노': 'の',
    '하': 'は', '히': 'ひ', '후': 'ふ', '헤': 'へ', '호': 'ほ',
    '마': 'ま', '미': '미', '무': 'む', '메': '메', '모': 'も',
    '야': 'や', '유': 'ゆ', '요': '요',
    '라': 'ら', '리': '리', '루': 'る', '레': 'れ', '로': 'ろ',
    '와': 'わ', '오': 'を', '응': 'ん',
    '가': '가', '기': 'ぎ', '구': 'ぐ', '게': 'げ', '고': 'ご',
    '자': 'ざ', '지': '지', '즈': 'ず', '제': 'ぜ', '조': 'ぞ',
    '다': 'だ', '지': 'ぢ', '즈': 'づ', '데': 'で', '도': '도',
    '바': 'ば', '비': 'び', '부': 'ぶ', '베': 'べ', '보': '보',
    '파': 'ぱ', '피': 'ぴ', '푸': 'ぷ', '페': 'ぺ', '포': 'ぽ',
    '은': 'は', '는': 'は', '에': 'に', '의': 'の', '를': 'を', '을': 'を', '도': 'も'
};

const commonCompounds = {
    "日本": ["に", "ほん"], "時間": ["じ", "かん"], "以前": ["い", "ぜん"], "最後": ["さい", "ご"],
    "今월": ["こん", "げつ"], "火山": ["か", "ざん"], "噴火": ["ふん", "か"], "一番": ["いち", "ばん"],
    "勉強": ["べん", "きょう"], "生活": ["せい", "かつ"], "探求": ["たん", "きゅう"]
};

let fixes = 0;
data.forEach(d => {
    let changed = false;

    // 1. CLEAN KOREAN
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/[가-힣]/g, (m) => charMap[m] || m);
        if (s.text !== old) changed = true;
    });

    // 2. GRANULAR SPLIT
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, read) => {
            if (kanjis.includes(d.kanji) && kanjis.length > 1) {
                // Heuristic: If we know the split
                if (commonCompounds[kanjis]) {
                    const r = commonCompounds[kanjis];
                    return r.map((p, i) => `[${kanjis[i]}](${p})`).join('');
                }
                // Heuristic: Length match
                if (kanjis.length === read.length) {
                    let res = '';
                    for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${read[i]})`;
                    return res;
                }
                // Semi-intelligent split for target kanji
                if (kanjis.length === 2 && read.length % 2 === 0) {
                    const half = read.length / 2;
                    return `[${kanjis[0]}](${read.substring(0, half)})[${kanjis[1]}](${read.substring(half)})`;
                }
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });

    if (changed) fixes++;
});

// Specifically fix N3 '探'
const targetKanjiObj = data.find(k => k.kanji === '探');
if (targetKanjiObj) {
    targetKanjiObj.on_sentence.text = "[宇](う)[宙](ちゅう)を[探](たん)[求](きゅう)する。";
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Deep global cleanup complete. Fixed ${fixes} items.`);
