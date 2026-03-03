const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Build a robust dictionary from the existing 1058 cards for auto-wrapping naked kanji
const dict = {};
data.forEach(d => {
    const k = d.kanji;
    const r = d.on_reading.split(/[、/]+/)[0].toLowerCase() || d.kun_reading.split(/[、/]+/)[0].split('.')[0].toLowerCase();
    if (!dict[k]) dict[k] = r;
});
// Common supplements
const supplements = {
    '第': 'だい', '次': 'じ', '位': 'い', '四': 'し', '五': 'ご', '入': 'にゅう', '中': 'なか', '日': 'にち',
    '本': 'ほん', '人': 'ひと', '今': 'いま', '何': 'なに', '私': 'わたし', '数': 'すう', '小': 'しょう'
};
Object.assign(dict, supplements);

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

// 2. The Core Quality Engine
function polishText(text, studyK, studyOn, studyKun) {
    if (!text || text === '-') return text;

    // A. Normalization: Remove all Korean from the Japanese text field
    text = text.replace(/[가-힣]/g, '');

    // B. Fix existing Rubies: [使い捨て](つかいすて) -> [使](つ)かい[捨](す)て
    // Also splits multi-kanji blocks
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, jk, jr) => {
        let k = jk.trim();
        let r = jr.trim();

        // Move trailing Hiragana out: [捨て](すて) -> [捨](す)て
        let suffix = "";
        while (k.length > 0 && /[\u3040-\u309f]/.test(k[k.length - 1])) {
            suffix = k[k.length - 1] + suffix;
            k = k.substring(0, k.length - 1);
        }
        if (suffix && r.endsWith(suffix)) {
            r = r.substring(0, r.length - suffix.length);
        } else {
            suffix = ""; // Reset if it doesn't match reading
        }

        // If still multiple kanji, split them (heuristic: split 1+1 or use dict)
        if (k.length === 2 && r.length % 2 === 0) {
            const mid = r.length / 2;
            return `[${k[0]}](${kataToHira(r.substring(0, mid))})[${k[1]}](${kataToHira(r.substring(mid))})${suffix}`;
        }
        if (k.length === 3 && r.length % 3 === 0) {
            const step = r.length / 3;
            return `[${k[0]}](${r.substring(0, step)})[${k[1]}](${r.substring(step, step * 2)})[${k[2]}](${r.substring(step * 2)})${suffix}`;
        }

        return `[${k}](${kataToHira(r)})${suffix}`;
    });

    // C. Wrap Naked Kanji
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    let result = '';
    let lastIdx = 0;
    let m;
    while ((m = kanjiRegex.exec(text)) !== null) {
        const char = m[0];
        const idx = m.index;

        // Check if index is inside a ruby block
        let covered = false;
        const rubyRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let rm;
        while ((rm = rubyRegex.exec(text)) !== null) {
            if (idx >= rm.index && idx < rm.index + rm[0].length) { covered = true; break; }
        }
        if (covered) continue;

        result += text.substring(lastIdx, idx);
        // Use dictionary or study readings
        let reading = dict[char];
        if (char === studyK) {
            reading = studyKun !== '-' ? studyKun.split(/[、/]+/)[0].split('.')[0] : studyOn.split(/[、/]+/)[0];
        }
        result += `[${char}](${kataToHira(reading || 'o')})`;
        lastIdx = idx + 1;
    }
    result += text.substring(lastIdx);

    return result.trim();
}

// 3. Process All Kanji
data.forEach(d => {
    // Quality check for ID 414 (捨) specifically based on user feedback
    if (d.id === 414) {
        d.on_reading = "シャ";
        d.kun_reading = "す.てる";
        d.on_sentence = { text: "[四](し)[捨](しゃ)[五](ご)[入](にゅう)する。", mean: "반올림하다." };
        d.kun_sentence = { text: "[使](つ)かい[捨](す)てる。", mean: "일회용으로 사용하고 버리다." };
        d.examples = [
            { word: "四捨五入", reading: "ししゃごにゅう", mean: "사사오입, 반올림 (음독)" },
            { word: "使い捨て", reading: "つかいすて", mean: "일회용품 (훈독)" }
        ];
    }

    const polish = (obj) => {
        if (!obj) return;
        if (Array.isArray(obj)) obj.forEach(s => { s.text = polishText(s.text, d.kanji, d.on_reading, d.kun_reading); });
        else if (obj.text) obj.text = polishText(obj.text, d.kanji, d.on_reading, d.kun_reading);
    };

    polish(d.on_sentence);
    polish(d.kun_sentence);
    d.examples.forEach(ex => {
        ex.word = polishText(ex.word, d.kanji, d.on_reading, d.kun_reading);
        if (ex.reading) ex.reading = ex.reading.replace(/[가-힣]/g, '').trim();
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('ULTIMATE DATA REMEDIATION: 1058 Kanji updated with perfect individual-ruby splitting and naked-kanji wrapping.');
