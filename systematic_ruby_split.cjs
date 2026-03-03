const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Common Compound Dictionary to ensure perfect splitting
const splitMap = {
    "風景": ["ふう", "けい"],
    "運転": ["うん", "てん"],
    "大学": ["だい", "がく"],
    "中止": ["ちゅう", "し"],
    "結婚": ["けっ", "こん"],
    "医자": ["い", "しゃ"], // Fix potential kor
    "医者": ["い", "しゃ"],
    "理由": ["り", "ゆう"],
    "九州": ["きゅう", "しゅう"],
    "東京": ["とう", "きょう"],
    "勉强": ["べん", "きょう"],
    "勉強": ["べん", "きょう"],
    "漢字": ["かん", "じ"],
    "今日": ["き", "ょう"],
    "明日": ["あした"], // Special case
    "名前": ["な", "まえ"],
    "時計": ["と", "けい"],
    "一番": ["いち", "ばん"],
    "十分": ["じゅう", "ぶん"],
    "曜日": ["よう", "び"],
    "日曜日": ["にち", "よう", "비"],
    "家族": ["か", "ぞく"],
    "学校": ["がっ", "こう"],
    "先生": ["せん", "せい"],
    "友達": ["とも", "だち"],
    "注意": ["ちゅう", "い"],
    "準備": ["じゅん", "び"]
};

let splitCount = 0;

const splitMultiKanji = (text) => {
    if (!text) return text;
    return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
        if (kanjis.length > 1) {
            // Priority 1: Manual Map
            if (splitMap[kanjis]) {
                const parts = splitMap[kanjis];
                if (parts.length === kanjis.length) {
                    return kanjis.split('').map((k, i) => `[${k}](${parts[i]})`).join('');
                }
            }

            // Priority 2: Simple 1:1 match
            if (kanjis.length === read.length) {
                return kanjis.split('').map((k, i) => `[${k}](${read[i]})`).join('');
            }

            // Priority 3: 1:2 matches (common in ON reading compounds like 'koku', 'shin')
            if (kanjis.length * 2 === read.length) {
                let res = '';
                for (let i = 0; i < kanjis.length; i++) {
                    res += `[${kanjis[i]}](${read.substring(i * 2, i * 2 + 2)})`;
                }
                return res;
            }
        }
        return full;
    });
};

data.forEach(d => {
    let changed = false;
    const process = (s) => {
        if (!s) return;
        if (Array.isArray(s)) {
            s.forEach(item => {
                const old = item.text;
                item.text = splitMultiKanji(item.text);
                if (item.text !== old) { changed = true; splitCount++; }
            });
        } else {
            const old = s.text;
            s.text = splitMultiKanji(s.text);
            if (s.text !== old) { changed = true; splitCount++; }
        }
    };
    process(d.on_sentence);
    process(d.kun_sentence);
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Granular ruby splitting complete. Total blocks split: ${splitCount}`);
