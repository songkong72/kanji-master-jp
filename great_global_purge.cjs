const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Phonetical Korean to Japanese mapping for automated repair
const korToJapMap = {
    '아': 'あ', '이': 'い', '우': 'う', '에': 'え', '오': 'お',
    '카': 'か', '키': 'き', '쿠': 'く', '케': 'け', '코': 'こ',
    '사': 'さ', '시': 'し', '스': 'す', '세': 'せ', '소': 'そ',
    '타': 'た', '치': 'ち', '츠': 'つ', '테': 'て', '토': 'と',
    '나': '나', '니': 'に', '누': 'ぬ', '네': 'ね', '노': '노', // fix '나' issue
    '나': 'な', '니': 'に', '누': 'ぬ', '네': 'ね', '노': 'の',
    '하': 'は', '히': 'ひ', '후': 'ふ', '헤': 'へ', '호': 'ほ',
    '마': 'ま', '미': 'み', '무': '무', // fix '무'
    '무': 'む', '메': 'め', '모': 'も',
    '야': 'や', '유': 'ゆ', '요': 'よ',
    '라': 'ら', '리': 'り', '루': 'る', '레': 'れ', '로': 'ろ',
    '와': 'わ', '오': 'を', '응': 'ん',
    '가': 'が', '기': 'ぎ', '구': 'ぐ', '게': 'げ', '고': 'ご',
    '자': 'ざ', '지': 'じ', '즈': 'ず', '제': 'ぜ', '조': 'ぞ',
    '다': 'だ', '지': 'ぢ', '즈': 'づ', '데': 'で', '도': 'ど',
    '바': 'ば', '비': 'び', '부': 'ぶ', '베': 'べ', '보': 'ぼ',
    '파': 'ぱ', '피': 'ぴ', '푸': 'ぷ', '페': 'ぺ', '포': 'ぽ',
    '온': 'おん', '시': 'し', '츠': 'つ', '다': 'だ', '레': 'れ'
};

// 2. Vocabulary manual splits for Granular Highlighting
const compoundSplits = {
    "探求": { kanjis: "探求", readings: ["たん", "きゅう"] },
    "一番": { kanjis: "一番", readings: ["いち", "ばん"] },
    "二月": { kanjis: "二月", readings: ["に", "がつ"] },
    "三月": { kanjis: "三月", readings: ["さん", "がつ"] },
    "四月": { kanjis: "四月", readings: ["し", "がつ"] },
    "五分": { kanjis: "五分", readings: ["ご", "ふん"] },
    "六時": { kanjis: "六時", readings: ["ろく", "じ"] },
    "七月": { kanjis: "七月", readings: ["しち", "がつ"] },
    "八月": { kanjis: "八月", readings: ["はち", "がつ"] },
    "九月": { kanjis: "九月", readings: ["く", "がつ"] },
    "十月": { kanjis: "十月", readings: ["じゅう", "がつ"] },
    "曜日": { kanjis: "요일", readings: ["よう", "び"] },
    "日曜日": { kanjis: "日曜日", readings: ["にち", "よう", "び"] },
    "日本": { kanjis: "日本", readings: ["に", "ほん"] },
    "今日": { kanjis: "今日", readings: ["き", "ょう"] }, // irregular
    "勉強": { kanjis: "勉強", readings: ["べん", "きょう"] },
    "月曜日": { kanjis: "月曜日", readings: ["げつ", "よう", "び"] }
};

let fixes = 0;

data.forEach(d => {
    let changed = false;

    // 0. Clean sentences that have no reading
    if (d.on_reading === '-' || d.on_reading === '') d.on_sentence = null;
    if (d.kun_reading === '-' || d.kun_reading === '') d.kun_sentence = null;

    // 1. Scan and replace Korean in sentences
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/[가-힣]/g, (match) => korToJapMap[match] || match);
        if (s.text !== old) changed = true;
    });

    // 2. Scan and replace Korean in examples
    if (d.examples) {
        d.examples.forEach(ex => {
            if (ex.reading && /[가-힣]/.test(ex.reading)) {
                ex.reading = ex.reading.replace(/[가-힣]/g, (m) => korToJapMap[m] || m);
                changed = true;
            }
            if (ex.word && /[가-힣]/.test(ex.word)) {
                ex.word = ex.word.replace(/[가-힣]/g, (m) => korToJapMap[m] || m);
                changed = true;
            }
        });
    }

    // 3. APPLY GRANULAR HIGHLIGHTING (Split multi-kanji blocks)
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;

        // Match [AB](ab) patterns where text contains more than one character but includes d.kanji
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
            if (kanjis.length > 1 && kanjis.includes(d.kanji)) {
                // Heuristic: If we have a manual split defined
                if (compoundSplits[kanjis]) {
                    const info = compoundSplits[kanjis];
                    return info.readings.map((r, i) => `[${info.kanjis[i]}](${r})`).join('');
                }

                // Heuristic: If kanji length == reading length (e.g. [四肢](しし))
                if (kanjis.length === read.length) {
                    let res = '';
                    for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${read[i]})`;
                    return res;
                }

                // Heuristic: Multi-kanji with long reading
                // We'll try to find where the target kanji is.
                // For "探求(たんきゅう)" for 探, we split safely if we can.
                if (kanjis === "探求" && read === "たんきゅう") return "[探](たん)[求](きゅう)";
                if (kanjis === "想像" && read === "そうぞう") return "[想](そう)[像](ぞう)";
            }
            return full;
        });
        if (s.text !== old) changed = true;
    });

    if (changed) fixes++;
});

// Specifically fix "探" screenshot issues
const sagasu = data.find(k => k.kanji === '探');
if (sagasu) {
    sagasu.on_sentence.text = "[宇](う)[宙](ちゅう)を[探](たん)[求](きゅう)する。";
    sagasu.kun_sentence.text = "[犯](はん)[人](にん)の[行](ゆ)[方](くえ)を[探](さが)す。";
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Global cleanup complete for ${data.length} items. Issues fixed in ${fixes} entries.`);
