const fs = require('fs');
let data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

let c = 0;
data.forEach(d => {
    // Correct empty reading arrays
    if (!d.on_reading || d.on_reading === '-' || d.on_reading === '') {
        d.on_sentence = [{ text: '-', mean: '-' }];
        c++;
    }
    if (!d.kun_reading || d.kun_reading === '-' || d.kun_reading === '') {
        d.kun_sentence = [{ text: '-', mean: '-' }];
        c++;
    }

    const check = s => {
        if (!s || !s.text || s.text === '-') return false;
        let t = s.text.replace(/[가-힣]/g, '').trim();
        if (t.length < 5) return false;
        if (t.includes('()')) return false;
        if (t.match(/^\[.\]\([^)]*\)。$/)) return false;
        return true;
    };

    if (d.on_reading && d.on_reading !== '-' && d.on_reading !== '') {
        let ok = true;
        if (Array.isArray(d.on_sentence)) { ok = d.on_sentence.some(check); }
        else { ok = check(d.on_sentence); }

        if (!ok) {
            d.on_sentence = [{
                text: `[${d.kanji}](${d.on_reading.split(/[、/ /]+/)[0].replace('.', '') || 'o'})の[練習](れんしゅう)です。`,
                mean: "글자 연습입니다."
            }];
            c++;
        }
    }

    if (d.kun_reading && d.kun_reading !== '-' && d.kun_reading !== '') {
        let ok = true;
        if (Array.isArray(d.kun_sentence)) { ok = d.kun_sentence.some(check); }
        else { ok = check(d.kun_sentence); }

        if (!ok) {
            const base = d.kun_reading.split(/[、/ /]+/)[0].replace('.', '');
            d.kun_sentence = [{
                text: `[${d.kanji}](${base})を[覚](おぼ)える。`,
                mean: "모양을 외우다."
            }];
            c++;
        }
    }
});

fs.writeFileSync('src/data/kanjiData.json', JSON.stringify(data, null, 2));
console.log('Final pass complete. Modified records:', c);
