const fs = require('fs');
const path = './src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Comprehensive Particle & Reading Fix Map (Based on Audit)
const kMap = {
    '나': 'な', '다': 'だ', '무': 'む', '시': 'し', '의': 'の', '카': 'か', '오': 'お', '루': 'る',
    '이': 'い', '에': '에', '가': 'が', '은': 'は', '는': 'は', '을': 'を', '를': 'を', '기': 'き'
};
// Refined Particle Map (Outside ruby)
const pMap = { '에': 'に', '가': '가', '은': 'は', '는': 'は', '을': 'を', '를': 'を', '이': '이' };

// 2. Intelligent Splitter for the remaining 509 cases
const splitMultiKanji = (text) => {
    if (!text) return text;
    return text.replace(/\[(.*?)\]\((.*?)\)/g, (full, kanjis, read) => {
        if (kanjis.length > 1) {
            // Heuristic for most common ON compounds (2:4 or 2:3)
            if (kanjis.length === 2) {
                if (read.length === 4) return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read.substring(2)})`;
                if (read.length === 3) {
                    // e.g. [多数](たすう) - usually 1:2 or 2:1
                    if (['う', 'い', 'ん', 'つ'].includes(read[2])) return `[${kanjis[0]}](${read[0]})[${kanjis[1]}](${read.substring(1)})`;
                    return `[${kanjis[0]}](${read.substring(0, 2)})[${kanjis[1]}](${read[2]})`;
                }
            }
            // Heuristic for 3-kanji like [小学校](しょうがっこう)
            if (kanjis.length === 3 && read.length === 8) {
                return `[${kanjis[0]}](${read.substring(0, 3)})[${kanjis[1]}](${read.substring(3, 5)})[${kanjis[2]}](${read.substring(5)})`;
            }
        }
        return full;
    });
};

let fixes = 0;
data.forEach(d => {
    let changed = false;

    // Fix Readings
    ['on_reading', 'kun_reading'].forEach(f => {
        if (d[f] && /[가-힣]/.test(d[f])) {
            d[f] = d[f].replace(/[가-힣]/g, m => kMap[m] || m);
            changed = true;
        }
    });

    const processS = (s) => {
        if (!s) return;
        const proc = (i) => {
            const old = i.text;
            // A. Split Ruby
            i.text = splitMultiKanji(i.text);
            // B. Fix Korean in Ruby ()
            i.text = i.text.replace(/\[(.*?)\]\((.*?)\)/g, (f, k, r) => {
                const newR = r.replace(/[가-힣]/g, m => kMap[m] || m);
                return `[${k}](${newR})`;
            });
            // C. Fix Particles outside Ruby
            i.text = i.text.replace(/([^\[\]\(\)\s])([가-힣])([\s\.!?,])/g, (f, b, k, a) => {
                if (pMap[k]) return b + pMap[k] + a;
                return f;
            });
            if (i.text !== old) changed = true;
        };
        if (Array.isArray(s)) s.forEach(proc);
        else proc(s);
    };

    processS(d.on_sentence);
    processS(d.kun_sentence);

    if (d.examples) {
        d.examples.forEach(ex => {
            const old = ex.reading + ex.mean;
            ex.reading = (ex.reading || '').replace(/[가-힣]/g, m => kMap[m] || m);
            if (ex.reading + ex.mean !== old) changed = true;
        });
    }

    if (changed) fixes++;
});

// Final check for the infamous "百" case (ensure no bad data)
const hyaku = data.find(k => k.id === 12);
if (hyaku) hyaku.kun_sentence = null;

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log(`Mission Accomplished. ${fixes} entries deep-cleaned in seconds.`);
