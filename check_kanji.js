import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

const krRegex = /[가-힣]/;

const problematic = data.slice(0, 500).filter(p => {
    const checkSentence = (s) => {
        if (!s) return false;
        if (Array.isArray(s)) return s.some(sub => krRegex.test(sub.text));
        return krRegex.test(s.text);
    };

    const checkExamples = (exs) => {
        return exs.some(ex => krRegex.test(ex.word) || krRegex.test(ex.reading));
    };

    return checkSentence(p.on_sentence) ||
        checkSentence(p.kun_sentence) ||
        checkExamples(p.examples);
});

const report = problematic.map(p => {
    const errors = [];
    const checkS = (s, name) => {
        if (!s) return;
        if (Array.isArray(s)) {
            s.forEach((sub, i) => { if (krRegex.test(sub.text)) errors.push(`${name}[${i}]: ${sub.text}`); });
        } else if (krRegex.test(s.text)) {
            errors.push(`${name}: ${s.text}`);
        }
    };
    checkS(p.on_sentence, 'on_sentence');
    checkS(p.kun_sentence, 'kun_sentence');
    p.examples.forEach((ex, i) => {
        if (krRegex.test(ex.word)) errors.push(`example[${i}].word: ${ex.word}`);
        if (krRegex.test(ex.reading)) errors.push(`example[${i}].reading: ${ex.reading}`);
    });
    return { id: p.id, kanji: p.kanji, errors };
});

console.log(JSON.stringify(report.filter(r => r.errors.length > 0), null, 2));
