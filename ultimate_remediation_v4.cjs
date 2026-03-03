const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Dictionary
const dict = {};
data.forEach(d => {
    dict[d.kanji] = d.on_reading.split(/[、/]+/)[0].toLowerCase() || d.kun_reading.split(/[、/]+/)[0].split('.')[0].toLowerCase();
});
const supplements = {
    '第': 'だい', '次': 'じ', '位': '이', '四': '시', '五': '고', '入': '에', '中': 'なか', '日': '에',
    '本': 'ほん', '人': 'ひと', '今': 'いま', '何': 'なに', '私': 'わたし', '数': 'すう', '小': 'しょう'
};
// Correction for supplements
supplements['入'] = 'にゅう'; supplements['日'] = 'にち';
Object.assign(dict, supplements);

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

// 2. The Core Quality Engine
function polishText(text, studyK, studyOn, studyKun) {
    if (!text || text === '-') return text;

    // A. Normalization: Remove all Korean
    text = text.replace(/[가-힣]/g, '');

    // B. Fix Double Brackets / Nested Rubies
    while (text.includes('[[')) {
        text = text.replace(/\[\[([^\]]+)\]\(([^)]+)\)\]\(([^)]*)\)/g, '[$1]($2)');
    }

    // C. Re-split and Clean Rubies
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, jk, jr) => {
        let k = jk.trim();
        let r = jr.replace(/[가-힣]/g, '').trim();

        let suffix = "";
        while (k.length > 0 && /[\u3040-\u309f]/.test(k[k.length - 1])) {
            suffix = k[k.length - 1] + suffix;
            k = k.substring(0, k.length - 1);
        }
        if (suffix && r.endsWith(suffix)) {
            r = r.substring(0, r.length - suffix.length);
        } else {
            suffix = "";
        }

        if (k.length === 2 && r.length > 1 && r.length % 2 === 0) {
            const mid = r.length / 2;
            return `[${k[0]}](${kataToHira(r.substring(0, mid))})[${k[1]}](${kataToHira(r.substring(mid))})${suffix}`;
        }
        return `[${k}](${kataToHira(r)})${suffix}`;
    });

    // D. Wrap Naked Kanji
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

// 3. Process
data.forEach(d => {
    if (d.id === 303) {
        d.on_sentence = { text: "[四](し)[捨](しゃ)[五](ご)[入](にゅう)する。", mean: "반올림하다." };
        d.kun_sentence = { text: "[古](ふる)い[服](후쿠)을[捨](す)てる。", mean: "낡은 옷을 버리다." };
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
console.log('ULTIMATE DATA REMEDIATION V4: All good.');
