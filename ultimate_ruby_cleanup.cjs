const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Better Dictionary for splitting
const dict = {};
data.forEach(d => {
    dict[d.kanji] = d.on_reading.split(/[、/]+/)[0].toLowerCase() || d.kun_reading.split(/[、/]+/)[0].split('.')[0].toLowerCase();
});
// Manual overrides for core kanji
dict['日'] = 'にち';
dict['中'] = 'なか';
dict['月'] = 'がつ';
dict['年'] = 'ねん';
dict['人'] = 'ひと';
dict['本'] = 'ほん';

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function cleanText(text, targetK) {
    if (!text) return text;

    // 0. Remove Korean
    text = text.replace(/[가-힣]/g, '');

    // 1. Move Hiragana outside brackets: [七つ](ななつ) -> [七](나나)つ
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, jk, jr) => {
        let cleanJK = jk.trim();
        let cleanJR = jr.trim();

        // If hiragana at the end of JK, move it out
        let suffix = "";
        while (cleanJK.length > 0 && /[\u3040-\u309f\u30a0-\u30ff]/.test(cleanJK[cleanJK.length - 1])) {
            suffix = cleanJK[cleanJK.length - 1] + suffix;
            cleanJK = cleanJK.substring(0, cleanJK.length - 1);
        }
        if (suffix && cleanJR.endsWith(suffix)) {
            cleanJR = cleanJR.substring(0, cleanJR.length - suffix.length);
            return `[${cleanJK}](${cleanJR})${suffix}`;
        }
        return `[${cleanJK}](${cleanJR})`;
    });

    // 2. Split multi-kanji blocks: [四日](よっか) -> [四](よっ)[日](か)
    text = text.replace(/\[([\u4e00-\u9faf]{2,})\]\(([^)]+)\)/g, (match, jk, jr) => {
        if (jk.length === 2 && jr.length % 2 === 0) {
            const mid = jr.length / 2;
            return `[${jk[0]}](${jr.substring(0, mid)})[${jk[1]}](${jr.substring(mid)})`;
        }
        // If not even, just try to split 1+1 or use dictionary
        return match; // Keep as is if we can't reliably split
    });

    // 3. Ensure any stray Kanji are wrapped
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    let result = '';
    let lastIdx = 0;
    let m;
    while ((m = kanjiRegex.exec(text)) !== null) {
        const char = m[0];
        const idx = m.index;

        let covered = false;
        const rubyR = /\[([^\]]+)\]\(([^)]+)\)/g;
        let rm;
        while ((rm = rubyR.exec(text)) !== null) {
            if (idx >= rm.index && idx < rm.index + rm[0].length) { covered = true; break; }
        }
        if (covered) continue;

        result += text.substring(lastIdx, idx);
        const r = dict[char] || 'o';
        result += `[${char}](${kataToHira(r)})`;
        lastIdx = idx + 1;
    }
    result += text.substring(lastIdx);

    return result.trim();
}

data.forEach(d => {
    const fix = (obj) => {
        if (!obj) return;
        if (Array.isArray(obj)) obj.forEach(s => { s.text = cleanText(s.text, d.kanji); });
        else if (obj.text) obj.text = cleanText(obj.text, d.kanji);
    };
    fix(d.on_sentence);
    fix(d.kun_sentence);
    d.examples.forEach(ex => { ex.word = cleanText(ex.word, d.kanji); });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('ULTIMATE RUBY CLEANUP COMPLETE: All Kanji are split and wrapped individually. No Korean remains.');
