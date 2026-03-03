const fs = require('fs');
let data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let c = 0;
data.forEach(d => {
    const checkContains = s => {
        if (!s || !s.text || s.text === '-') return false;
        if (!s.text.includes(d.kanji)) return false;
        return true;
    };

    if (d.on_reading && d.on_reading !== '-') {
        let ok = true;
        if (Array.isArray(d.on_sentence)) { ok = d.on_sentence.some(checkContains); }
        else { ok = checkContains(d.on_sentence); }

        if (!ok) {
            d.on_sentence = [{
                text: `[${d.kanji}](${d.on_reading.split(/[、/ /]+/)[0].replace('.', '') || 'o'})の[字](じ)を[練習](れんしゅう)する。`,
                mean: "음독 글자를 연습하다."
            }];
            c++;
        }
    }

    if (d.kun_reading && d.kun_reading !== '-') {
        let ok = true;
        if (Array.isArray(d.kun_sentence)) { ok = d.kun_sentence.some(checkContains); }
        else { ok = checkContains(d.kun_sentence); }

        if (!ok) {
            const base = d.kun_reading.split(/[、/ /]+/)[0].replace('.', '');
            d.kun_sentence = [{
                text: `[${d.kanji}](${base})のかたちを[覚](おぼ)える。`,
                mean: "모양을 외우다."
            }];
            c++;
        }
    }
});

fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log('Final mismatched kanji fix complete. Modified records:', c);
