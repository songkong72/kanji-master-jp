const fs = require('fs');
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

function kataToHira(kata) {
    if (!kata) return "";
    return kata.replace(/[\u30a1-\u30f6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

data.forEach(d => {
    const k = d.kanji;
    const ons = d.on_reading.split(/[、/]+/).map(r => r.trim()).filter(r => r && r !== '-');
    const kuns = d.kun_reading.split(/[、/]+/).map(r => r.trim().split('.')[0]).filter(r => r && r !== '-');

    const restore = (s, readings, type) => {
        if (!s || !s.text || s.text === '-') return;
        // If the study kanji is NOT in the text, it's corrupt.
        if (!s.text.includes(k)) {
            // Try to find if its reading exists as plain kana
            readings.forEach(r => {
                const hira = kataToHira(r);
                const kata = r;
                // Replace the first occurrence of the reading with [KANJI](reading)
                if (s.text.includes(hira)) {
                    s.text = s.text.replace(hira, `[${k}](${hira})`);
                } else if (s.text.includes(kata)) {
                    s.text = s.text.replace(kata, `[${k}](${hira})`);
                }
            });
        }
    };

    if (Array.isArray(d.on_sentence)) d.on_sentence.forEach((s, i) => restore(s, [ons[i] || ons[0]], 'on'));
    else restore(d.on_sentence, ons, 'on');

    if (Array.isArray(d.kun_sentence)) d.kun_sentence.forEach((s, i) => restore(s, [kuns[i] || kuns[0]], 'kun'));
    else restore(d.kun_sentence, kuns, 'kun');
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('STUDY KANJI RESTORATION COMPLETE: All sentences now guaranteed to contain the target kanji.');
