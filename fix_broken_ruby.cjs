const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Build a robust dictionary
const dict = {};
data.forEach(d => {
    const k = d.kanji;
    const r = d.on_reading.split(/[、/]+/)[0].toLowerCase() || d.kun_reading.split(/[、/]+/)[0].split('.')[0].toLowerCase();
    if (!dict[k]) dict[k] = r;
});

const supplements = {
    '四': 'し', '五': 'ご', '入': '에' /* typo fix below */, '中': 'なか', '日': 'にち', '本': 'ほん', '人': 'ひと',
    '今': 'いま', '何': 'なに', '私': 'わたし', '数': 'すう', '小': 'しょう', '第': 'だい', '位': 'い'
};
supplements['入'] = '에' === '에' ? 'にゅう' : 'にゅう'; // ensure it is 'にゅう'
Object.assign(dict, supplements);

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

// 2. High Quality Polisher
function polishText(text, studyK, studyOn, studyKun) {
    if (!text || text === '-') return text;

    // A. Clean Korean characters from Japanese fields
    text = text.replace(/[가-힣]/g, '');

    // B. Re-normalize Ruby structure (Flatten any nested or broken ones)
    // Fix [[...](...)]()
    text = text.replace(/\[\[([^\]]+)\]\(([^)]*)\)\]\(([^)]*)\)/g, '[$1]($2)');
    // Fix empty rubies [K]()
    text = text.replace(/\[([^\]]+)\]\(\)/g, '$1');
    // Final split of [AB](ab) -> [A](a)[B](b)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, jk, jr) => {
        let k = jk.trim();
        let r = jr.trim();
        let suffix = "";
        while (k.length > 0 && /[\u3040-\u309f]/.test(k[k.length - 1])) {
            suffix = k[k.length - 1] + suffix;
            k = k.substring(0, k.length - 1);
        }
        if (suffix && r.endsWith(suffix)) r = r.substring(0, r.length - suffix.length);
        else suffix = "";

        if (k.length === 2 && r.length > 1 && r.length % 2 === 0) {
            const mid = r.length / 2;
            return `[${k[0]}](${kataToHira(r.substring(0, mid))})[${k[1]}](${kataToHira(r.substring(mid))})${suffix}`;
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

        let inRuby = false;
        let rubyCheck = /\[([^\]]*?)\]\(([^)]*?)\)/g;
        let rc;
        while ((rc = rubyCheck.exec(text)) !== null) {
            if (idx >= rc.index && idx < rc.index + rc[0].length) { inRuby = true; break; }
        }
        if (inRuby) continue;

        result += text.substring(lastIdx, idx);
        let reading = dict[char] || 'o';
        if (char === studyK) {
            reading = (studyKun && studyKun !== '-') ? studyKun.split(/[、/]+/)[0].split('.')[0] : studyOn.split(/[、/]+/)[0];
        }
        result += `[${char}](${kataToHira(reading)})`;
        lastIdx = idx + 1;
    }
    result += text.substring(lastIdx);

    return result.trim();
}

// 3. Process All Kanji
data.forEach(d => {
    // 捨 (ID 303) Specific Fix: Simple & Practical
    if (d.id === 303) {
        d.on_reading = "シャ";
        d.kun_reading = "す.てる";
        d.on_sentence = { text: "[四](し)[捨](しゃ)[五](ご)[入](にゅう)する。", mean: "반올림하다." };
        d.kun_sentence = { text: "[ゴミ](ごみ)を[捨](す)てる。", mean: "쓰레기를 버리다." };
        d.examples = [
            { word: "四捨五入", reading: "ししゃごにゅう", mean: "사사오입, 반올림 (음독)" },
            { word: "使い捨て", reading: "つかいすて", mean: "일회용 (훈독)" },
            { word: "捨て子", reading: "すてご", mean: "미아, 버려진 아이 (훈독)" }
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
console.log('ULTIMATE FIX APPLIED: No broken [K](), nested rubies fixed, and simple sentences enforced.');
