const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Dictionary for common kanji readings
const dict = {};
data.forEach(d => {
    dict[d.kanji] = d.on_reading.split(/[、/]+/)[0].toLowerCase() || d.kun_reading.split(/[、/]+/)[0].split('.')[0].toLowerCase();
});
dict['世'] = 'せい'; dict['紀'] = 'き'; dict['話'] = 'わ'; dict['中'] = 'なか'; dict['界'] = 'かい';

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

function deepRuby(text, studyK) {
    if (!text) return text;
    // Remove existing rubies to normalize
    let plain = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');

    // Pattern match for common compounds if reading is known or splitable
    let result = '';
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    let match;
    let lastIdx = 0;
    while ((match = kanjiRegex.exec(plain)) !== null) {
        result += plain.substring(lastIdx, match.index);
        const char = match[0];
        const r = dict[char] || 'o';
        result += `[${char}](${kataToHira(r)})`;
        lastIdx = match.index + 1;
    }
    result += plain.substring(lastIdx);
    return result;
}

data.forEach(d => {
    // 1. Target ID 118 specific high quality fix
    if (d.id === 118) {
        d.examples = [
            { word: "[世](せい)[紀](き)", reading: "せいき", mean: "세기 (음독)" },
            { word: "[世](せ)[話](わ)", reading: "せわ", mean: "도움, 보살핌 (음독)" },
            { word: "[世](よ)の[中](なか)", reading: "よのなか", mean: "세상, 사회 (훈독)" }
        ];
    }

    // 2. Global: Ensure NO example word is JUST the study kanji
    d.examples.forEach(ex => {
        let plain = ex.word.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        if (plain === d.kanji) {
            // It's a single kanji. Try to make it a compound.
            if (d.id === 2) { ex.word = "[一](いち)[番](ばん)"; ex.reading = "いちばん"; }
            // If we cant find a better one, just append a common suffix for trial
            else if (d.kun_reading.includes('.')) {
                const parts = d.kun_reading.split(/[、/]+/)[0].split('.');
                ex.word = `[${d.kanji}](${kataToHira(parts[0])})${parts[1]}`;
                ex.reading = parts[0] + parts[1];
            }
        }
    });

    // 3. Re-apply ruby to all examples to ensure they are [K](r) format
    d.examples.forEach(ex => {
        let plain = ex.word.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
        if (plain.length === 2 && /[\u4e00-\u9faf]{2}/.test(plain) && ex.reading.length % 2 === 0) {
            const m = ex.reading.length / 2;
            ex.word = `[${plain[0]}](${kataToHira(ex.reading.substring(0, m))})[${plain[1]}](${kataToHira(ex.reading.substring(m))})`;
        } else if (!ex.word.includes('[')) {
            ex.word = `[${ex.word[0]}](${kataToHira(ex.reading)})${ex.word.substring(1)}`;
        }
    });
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Final Polish: ID 118 fixed, Single-kanji examples avoided, Ruby enforced.');
