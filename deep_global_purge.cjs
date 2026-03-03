const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Char map for phonetics
const charMap = {
    '아': 'あ', '이': 'い', '우': 'う', '에': 'え', '오': 'お',
    '카': 'か', '키': 'き', '쿠': 'く', '케': 'け', '코': 'こ',
    '사': 'さ', '시': 'し', '스': 'す', '세': 'せ', '소': 'そ',
    '타': 'た', '치': 'ち', '츠': 'つ', '테': 'て', '토': 'と',
    '나': 'な', '니': 'に', '누': 'ぬ', '네': 'ね', '노': 'の',
    '하': 'は', '히': 'ひ', '후': 'ふ', '헤': 'へ', '호': 'ほ',
    '마': 'ま', '미': '미', '무': 'む', '메': 'め', '모': 'も',
    '야': 'や', '유': 'ゆ', '요': '요', '가': 'が', '기': 'ぎ',
    '구': 'ぐ', '게': 'げ', '고': 'ご', '자': 'ざ', '지': 'じ',
    '즈': 'ず', '제': 'ぜ', '조': 'ぞ', '다': 'だ', '지': 'ぢ',
    '즈': 'づ', '데': 'で', '도': 'ど', '바': 'ば', '비': 'び',
    '부': 'ぶ', '베': 'べ', '보': 'ぼ', '파': 'ぱ', '피': 'ぴ',
    '푸': 'ぷ', '페': 'ぺ', '포': 'ぽ', '은': 'は', '는': 'は',
    '이': '이', '에': 'に', '의': 'の', '를': 'を', '을': 'を',
    '와': 'と', '과': 'と', '도': 'も', '를': 'を'
};

const commonSplits = {
    "日本": ["に", "ほん"], "時間": ["じ", "かん"], "以前": ["い", "ぜん"], "最後": ["さい", "ご"],
    "今月": ["こん", "げつ"], "火山": ["か", "ざん"], "噴火": ["ふん", "か"], "一番": ["いち", "ばん"],
    "月曜": ["げつ", "よう"], "火曜": ["か", "よう"], "水曜": ["すい", "よう"], "木曜": ["もく", "よう"],
    "金曜": ["きん", "よう"], "土曜": ["ど", "よう"], "日曜": ["にち", "よう"], "毎日": ["まい", "にち"],
    "電話": ["でん", "わ"], "電気": ["でん", "き"], "電車": ["でん", "しゃ"], "勉強": ["べん", "きょう"],
    "最近": ["さい", "きん"], "最初": ["さい", "しょ"], "最后": ["さい", "ご"], "最後": ["さい", "ご"],
    "生活": ["せい", "かつ"], "生活": ["せい", "かつ"], "大学": ["だい", "がく"], "学校": ["がっ", "こう"],
    "学生": ["がく", "せい"], "先生": ["せん", "せい"], "会社": ["かい", "しゃ"], "仕事": ["し", "ごと"],
    "自分": ["じ", "ぶん"], "世界": ["せ", "かい"], "平和": ["へい", "わ"], "理由": ["り", "ゆう"],
    "意味": ["い", "み"], "社会": ["しゃ", "かい"], "歴史": ["れき", "し"], "文化": ["ぶん", "か"]
};

let fixes = 0;
data.forEach(d => {
    let changed = false;

    // A. NO KOREAN IN JAP FIELDS (Strict across ALL levels)
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/[가-힣]/g, (m) => charMap[m] || m);
        if (s.text !== old) changed = true;
    });
    if (d.examples) {
        d.examples.forEach(ex => {
            if (ex.reading && /[가-힣]/.test(ex.reading)) {
                ex.reading = ex.reading.replace(/[가-힣]/g, (m) => charMap[m] || m);
                changed = true;
            }
            if (ex.word && /[가-힣]/.test(ex.word)) {
                ex.word = ex.word.replace(/[가-힣]/g, (m) => charMap[m] || m);
                changed = true;
            }
        });
    }

    // B. GRANULAR HIGHLIGHTING (Split multi-kanji blocks for target kanji)
    [d.on_sentence, d.kun_sentence].forEach(s => {
        if (!s || !s.text) return;
        const old = s.text;
        s.text = s.text.replace(/\[(.*?)\]\((.*?)\)/g, (match, kanjis, read) => {
            if (kanjis.includes(d.kanji) && kanjis.length > 1) {
                // Heuristic 1: Dictionary
                if (commonSplits[kanjis]) {
                    const r = commonSplits[kanjis];
                    return r.map((p, i) => `[${kanjis[i]}](${p})`).join('');
                }

                // Heuristic 2: kanji count == reading count
                if (kanjis.length === read.length) {
                    let res = '';
                    for (let i = 0; i < kanjis.length; i++) res += `[${kanjis[i]}](${read[i]})`;
                    return res;
                }

                // Heuristic 3: 2 kanji, even-ish reading length
                if (kanjis.length === 2 && read.length % 2 === 0) {
                    const half = read.length / 2;
                    return `[${kanjis[0]}](${read.substring(0, half)})[${kanjis[1]}](${read.substring(half)})`;
                }

                // Heuristic 4: Split manually known ones
                if (kanjis === "探求") return "[探](たん)[求](きゅう)";
                if (kanjis === "想像") return "[想](そう)[像](ぞう)";
            }
            return match;
        });
        if (s.text !== old) changed = true;
    });

    if (changed) fixes++;
});

// Specifically fix "探" screenshot context
const探 = data.find(k => k.kanji === '探');
if (探) {
    探.on_sentence.text = "[宇](う)[宙](ちゅう)を[探](たん)[求](きゅう)する。";
}

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Deep purge finished. Fixed ${fixes} items.`);
