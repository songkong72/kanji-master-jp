const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Reading Dictionary
const dict = {};
data.forEach(d => {
    const ons = (d.on_reading || "").split(/[、/ /]+/).map(s => s.trim()).filter(Boolean);
    const kuns = (d.kun_reading || "").split(/[、/ /]+/).map(s => s.trim()).filter(Boolean);
    dict[d.kanji] = kataToHira(ons[0] || (kuns[0] || "").split('.')[0] || "o");
});
dict['明'] = 'めい'; dict['赤'] = 'あか'; dict['物'] = 'もの'; dict['紙'] = 'かみ';

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function nuclearPolish(text, studyK, studyOn, studyKun) {
    if (!text || text === '-') return text;

    // 1. Strip ALL Hangul and normalize
    let s = text.replace(/[\uac00-\ud7af\u3130-\u318f]/g, '').trim();

    // 2. Destroy all ruby markup and start fresh (safest way to fix nesting)
    let plain = s.replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1');
    // Remove remaining artifacts
    plain = plain.replace(/[\[\]\(\)]/g, '');

    // 3. Re-wrap every kanji
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    let final = '';
    let lastIdx = 0;
    let m;
    while ((m = kanjiRegex.exec(plain)) !== null) {
        const char = m[0];
        const idx = m.index;
        final += plain.substring(lastIdx, idx);

        let rd = (char === studyK) ? (studyOn || studyKun || "o") : (dict[char] || "o");
        final += `[${char}](${kataToHira(rd.split(/[、/ /.]+/)[0])})`;
        lastIdx = idx + 1;
    }
    final += plain.substring(lastIdx);

    // 4. Special fix for common suffixes/okurigana (Heuristic)
    // If the original 's' had specific okurigana patterns, we might want to preserve them.
    // But for now, let's keep it simple. Standard ruby wrapping is better than broken nesting.

    return final.trim();
}

data.forEach(d => {
    const k = d.kanji;
    const proc = (field) => {
        let arr = Array.isArray(d[field]) ? d[field] : (d[field]?.text ? [d[field]] : []);
        arr.forEach(s => {
            s.text = nuclearPolish(s.text, k, d.on_reading, d.kun_reading);
        });
        d[field] = arr;
    };
    proc('on_sentence');
    proc('kun_sentence');

    d.examples.forEach(ex => {
        ex.word = nuclearPolish(ex.word, k, d.on_reading, d.kun_reading);
        ex.reading = ex.reading.replace(/[\uac00-\ud7af\u3130-\u318f]/g, '').trim();
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('NUCLEAR POLISH COMPLETE: All rubies rebuilt from plain text. No more nesting.');
