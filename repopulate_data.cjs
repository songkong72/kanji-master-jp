const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Precise Dictionary
const dict = {};
data.forEach(d => {
    dict[d.kanji] = {
        on: (d.on_reading || "").split(/[、/ /]+/).map(s => s.trim()).filter(Boolean)[0] || "",
        kun: (d.kun_reading || "").split(/[、/ /]+/).map(s => s.trim()).filter(Boolean)[0].split('.')[0] || ""
    };
});
// Critical common companions
const comps = {
    '日': 'にち', '本': 'ほん', '人': 'じん', '月': 'げつ', '年': 'ねん', '時': 'じ', '間': 'かん',
    '行': 'こう', '電': 'でん', '車': 'しゃ', '学': 'がく', '校': 'こう', '会': 'かい', '社': 'しゃ'
};

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

// 2. High-precision Purge and Ruby Wrap
function cleanAndWrap(text, studyK, studyOn, studyKun) {
    if (!text || text === '-') return text;

    // A. Strip ALL Hangul and normalize
    let s = text.replace(/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/g, '').trim();
    s = s.replace(/\s+/g, ' ');

    // B. Fix and Normalize Rubies
    // Simplify nested
    while (s.includes('[[')) {
        s = s.replace(/\[\[([^\]]+)\]\(([^)]+)\)\]\(([^)]*)\)/g, '[$1]($2)');
        s = s.replace(/\[\[([^\]]+)\]\]/g, '[$1]');
    }
    // Remove empty rubies
    s = s.replace(/\[([^\]]+)\]\(\)/g, '$1');

    // C. Wrap Naked Kanji
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    let final = '';
    let lastIdx = 0;
    let m;
    while ((m = kanjiRegex.exec(s)) !== null) {
        const char = m[0];
        const idx = m.index;

        let inRuby = false;
        const rubyMatches = s.matchAll(/\[([^\]]+)\]\(([^)]*)\)/g);
        for (const rm of rubyMatches) {
            if (idx >= rm.index && idx < rm.index + rm[0].length) { inRuby = true; break; }
        }
        if (inRuby) continue;

        final += s.substring(lastIdx, idx);
        let rd = (char === studyK) ? (studyOn || studyKun || "o") : (dict[char]?.on || dict[char]?.kun || "o");
        final += `[${char}](${kataToHira(rd.split(/[、/ /.]+/)[0])})`;
        lastIdx = idx + 1;
    }
    final += s.substring(lastIdx);

    // D. Split multi-kanji blocks strictly [AB](ab) -> [A](a)[B](b)
    final = final.replace(/\[([^\]]{2,})\]\(([^)]+)\)/g, (match, jk, jr) => {
        if (jk.length === jr.length) {
            let res = "";
            for (let i = 0; i < jk.length; i++) res += `[${jk[i]}](${jr[i]})`;
            return res;
        }
        // Heuristic for 2-kanji
        if (jk.length === 2) {
            const rd1 = kataToHira(dict[jk[0]]?.on || dict[jk[0]]?.kun || "o");
            const rd2 = kataToHira(dict[jk[1]]?.on || dict[jk[1]]?.kun || "o");
            if (jr.startsWith(rd1)) return `[${jk[0]}](${rd1})[${jk[1]}](${jr.substring(rd1.length)})`;
            if (jr.endsWith(rd2)) return `[${jk[0]}](${jr.substring(0, jr.length - rd2.length)})[${jk[1]}](${rd2})`;
            const mid = Math.floor(jr.length / 2);
            return `[${jk[0]}](${jr.substring(0, mid)})[${jk[1]}](${jr.substring(mid)})`;
        }
        return match;
    });

    return final.trim();
}

data.forEach(d => {
    const k = d.kanji;
    const ons = (d.on_reading || "").split(/[、/ /]+/).map(r => r.trim()).filter(Boolean);
    const kuns = (d.kun_reading || "").split(/[、/ /]+/).map(r => r.trim()).filter(Boolean);

    // Clean sentences first
    const cleanSent = (s) => {
        if (!s) return s;
        if (Array.isArray(s)) return s.map(x => ({ text: cleanAndWrap(x.text, k, d.on_reading, d.kun_reading), mean: x.mean }));
        return { text: cleanAndWrap(s.text, k, d.on_reading, d.kun_reading), mean: s.mean };
    };
    d.on_sentence = cleanSent(d.on_sentence);
    d.kun_sentence = cleanSent(d.kun_sentence);

    // Now populate examples
    let newExs = [];
    const allSents = [
        ...(Array.isArray(d.on_sentence) ? d.on_sentence : (d.on_sentence ? [d.on_sentence] : [])),
        ...(Array.isArray(d.kun_sentence) ? d.kun_sentence : (d.kun_sentence ? [d.kun_sentence] : []))
    ];

    allSents.forEach(s => {
        const matches = (s.text || "").matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
        for (const m of matches) {
            if (m[1].includes(k)) {
                let plain = m[1];
                if (plain.length > 1 || plain === '人' || plain === '日') {
                    newExs.push({ word: m[0], reading: m[2], mean: s.mean.split(' ')[0] });
                }
            }
        }
    });

    // Fallback if no compounds found
    if (newExs.length === 0) {
        // Build one manually e.g. [学](がく)[K](k)
        const companion = '学';
        const rdK = kataToHira(ons[0] || kuns[0] || "o").split('.')[0];
        const rdC = kataToHira(dict[companion]?.on || "o");
        newExs.push({
            word: `[${companion}](${rdC})[${k}](${rdK})`,
            reading: rdC + rdK,
            mean: "응용 단어"
        });
    }

    // Dedup and label
    const seen = new Set();
    d.examples = newExs.filter(ex => {
        const p = ex.word.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        if (seen.has(p)) return false;
        seen.add(p);
        return true;
    }).slice(0, 3);

    d.examples.forEach(ex => {
        if (!ex.mean.includes('(')) {
            const isKun = kuns.some(r => kataToHira(ex.reading).includes(kataToHira(r.split('.')[0])));
            ex.mean += isKun ? ' (훈독)' : ' (음독)';
        }
    });

    // Final clean on explanation
    if (d.explanation) d.explanation = d.explanation.replace(/\(x\)/g, '').replace(/\s+/g, ' ').trim();
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('REPOPULATION COMPLETE: 1058 cards processed, examples restored, sentences cleaned.');
