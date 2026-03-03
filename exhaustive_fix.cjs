const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const k2h = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));

// 1. Particle & Reading Fix Map
const korToJapMap = {
    '나': 'な', '다': 'だ', '무': 'む', '시': 'し', '의': 'の', '카': 'か', '오': 'お', '루': '루', // wait '루' is wrong
    ' 루': 'る', '루': 'る', '이': 'い', '에': 'え', '가': 'が', '은': 'は', '는': 'は', '을': 'を', '를': 'を', '기': 'き',
    '하': 'は', '히': 'ひ', '후': 'ふ', '헤': 'へ', '호': 'ほ'
};

const particleMap = { '에': 'に', '가': '가', '은': 'は', '는': '는', '을': 'を', '를': '를' }; // wait conservative

// 2. Intelligent Compound Splitter (Enhanced)
const splitMap = {
    "今日": ["きょ", "う"],
    "明日": ["あし", "た"],
    "昨日": ["きの", "う"],
    "大人": ["おと", "な"],
    "一人": ["ひと", "り"],
    "二人": ["ふた", "り"],
    "小学校": ["しょう", "がっ", "こう"],
    "中学校": ["ちゅう", "가っ", "こう"],
    "高校": ["こう", "こう"],
    "勉強": ["べん", "きょう"],
    "料理": ["りょう", "り"],
    "旅行": ["りょ", "こう"],
    "時間": ["じ", "かん"],
    "時計": ["と", "け이"],
    "一番": ["いち", "ばん"],
    "十分": ["じゅう", "ぶん"],
    "日本": ["に", "ほん"],
    "名前": ["나", "まえ"]
};

const splitRuby = (text) => {
    if (!text) return text;
    // Fix "Today" reading specifically first
    text = text.replace(/\[今\]\(い\)\[日\]\(ま\)/g, "[今](きょ)[日](う)");
    text = text.replace(/\[今日\]\(いま\)/g, "[今](きょ)[日](う)");

    return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
        if (kanjis.length > 1) {
            if (splitMap[kanjis]) {
                const parts = splitMap[kanjis];
                if (parts.length === kanjis.length) return kanjis.split('').map((k, i) => `[${k}](${parts[i]})`).join('');
            }
            if (kanjis.length === read.length) return kanjis.split('').map((k, i) => `[${k}](${read[i]})`).join('');
            // 2:4 ratio match
            if (kanjis.length === 2 && read.length === 4) return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
        }
        return full;
    });
};

const cleanText = (text) => {
    if (!text) return text;
    // Fix Korean particles at the end of kanji
    return text.replace(/([\)\]])에/g, "$1に")
        .replace(/([\)\]])가/g, "$1が")
        .replace(/([\)\]])은/g, "$1は")
        .replace(/([\)\]])는/g, "$1は")
        .replace(/([\)\]])을/g, "$1を")
        .replace(/([\)\]])를/g, "$1を");
};

let fixes = 0;

data.forEach(d => {
    let changed = false;

    // 1. Reading Clean (No Korean)
    ['on_reading', 'kun_reading'].forEach(f => {
        if (d[f] && /[가-힣]/.test(d[f])) {
            d[f] = d[f].replace(/[가-힣]/g, m => korToJapMap[m] || m);
            changed = true;
        }
    });

    // 2. Sentence Consistency (Multi-reading array)
    const ons = d.on_reading === '-' ? [] : d.on_reading.split('/').map(r => r.trim());
    const kuns = d.kun_reading === '-' ? [] : d.kun_reading.split('/').map(r => r.trim());

    if (ons.length > 1 && d.on_sentence && !Array.isArray(d.on_sentence)) {
        d.on_sentence = [d.on_sentence];
        changed = true;
    }
    if (kuns.length > 1 && d.kun_sentence && !Array.isArray(d.kun_sentence)) {
        d.kun_sentence = [d.kun_sentence];
        changed = true;
    }

    // 3. Sentence Cleanup (Ruby splitting & Particle cleanup)
    const procS = (s) => {
        if (!s) return;
        (Array.isArray(s) ? s : [s]).forEach(i => {
            const old = i.text;
            i.text = splitRuby(i.text);
            i.text = cleanText(i.text);
            // Final check for Korean in Ruby
            i.text = i.text.replace(/\[(.*?)\]\((.*?)\)/g, (f, k, r) => `[${k}](${r.replace(/[가-힣]/g, m => korToJapMap[m] || m)})`);
            if (i.text !== old) changed = true;
        });
    };
    procS(d.on_sentence);
    procS(d.kun_sentence);

    // 4. Example Word Diversity & Labelling
    if (d.examples) {
        d.examples.forEach(ex => {
            const old = ex.reading + ex.mean;
            ex.reading = ex.reading.replace(/[가-힣]/g, m => korToJapMap[m] || m);

            // Add (음독)/(훈독) label if missing
            if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
                const onP = ons.map(r => k2h(r.toLowerCase()).split('.')[0]);
                if (onP.some(p => ex.reading.startsWith(p))) ex.mean += ' (음독)';
                else ex.mean += ' (훈독)';
            }
            if (ex.reading + ex.mean !== old) changed = true;
        });
    }

    if (changed) fixes++;
});

// Specific fix for ID 12 (百) - as per user point
const hyaku = data.find(k => k.id === 12);
if (hyaku) hyaku.kun_sentence = null;

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Exhaustive fix complete. ${fixes} entries deep-cleaned and standardized.`);
