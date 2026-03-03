const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const splitMap = {
    // N5-N4 common irregulars
    "入学": ["にゅう", "がく"],
    "試験": ["し", "けん"],
    "歴史": ["れき", "し"],
    "小学校": ["しょう", "がっ", "こう"],
    "中学校": ["ちゅう", "がっ", "こう"],
    "高校": ["こう", "こう"],
    "頑張": ["がん", "ば"],
    "昨日": ["きのう"], // Special compound
    "明日": ["あした"],
    "今日": ["きょう"],
    "大人": ["おとな"],
    "一人": ["ひとり"],
    "二人": ["ふたり"],
    "三人": ["さん", "にん"],
    "四人": ["よ", "にん"],
    "飛行機": ["ひ", "こう", "き"],
    "自動車": ["じ", "どう", "しゃ"],
    "図書館": ["と", "しょ", "かん"],
    "映画館": ["えい", "が", "かん"],
    "動物": ["どう", "ぶつ"],
    "植物": ["しょく", "ぶつ"],
    "料理": ["りょう", "り"],
    "旅行": ["りょ", "こう"],
    "写真": ["しゃ", "しん"],
    "雑誌": ["ざっ", "し"],
    "宿題": ["しゅく", "だい"]
};

const splitMultiKanji = (text) => {
    if (!text) return text;
    return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
        if (kanjis.length > 1) {
            if (splitMap[kanjis]) {
                const parts = splitMap[kanjis];
                if (parts.length === kanjis.length) {
                    return kanjis.split('').map((k, i) => `[${k}](${parts[i]})`).join('');
                } else if (parts.length === 1 && kanjis.length > 1) {
                    // Special case like 昨日(きのう)
                    return `[${kanjis}](${read})`; // Actually as per guideline [AB](abc) is bad unless splittable
                    // If it's ateji/jukujukun, some might not be strictly splittable, but we try as per guide
                }
            }
            if (kanjis.length === read.length) return kanjis.split('').map((k, i) => `[${k}](${read[i]})`).join('');

            // Heuristic for long compound like [料理](りょうり) - 2:4
            if (kanjis.length === 2 && read.length === 4) {
                return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
            }
        }
        return full;
    });
};

let count = 0;
data.forEach(d => {
    const process = (s) => {
        if (!s) return;
        const procItem = (i) => {
            const old = i.text;
            i.text = splitMultiKanji(i.text);
            if (i.text !== old) count++;
        };
        if (Array.isArray(s)) s.forEach(procItem);
        else procItem(s);
    };
    process(d.on_sentence);
    process(d.kun_sentence);
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Deep Sweep Complete. ${count} blocks fixed.`);
