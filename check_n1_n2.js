import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/data/kanjiData.json', 'utf8'));

const krRegex = /[가-힣]/;

const report = data.filter(p => p.category === 'N2' || p.category === 'N1').map(p => {
    const errors = [];

    const checkArrayNeeded = (s, readingsStr) => {
        if (!s) return;
        const readings = readingsStr.split(/[,/.]/).filter(r => r && r !== '-' && r !== '');
        if (readings.length > 1 && !Array.isArray(s)) {
            errors.push(`Should be an array (readings: ${readings.join(', ')})`);
        }
    };

    const checkS = (s, name) => {
        if (!s) return;
        if (Array.isArray(s)) {
            s.forEach((sub, i) => { if (krRegex.test(sub.text)) errors.push(`${name}[${i}] has Korean: ${sub.text}`); });
        } else {
            if (krRegex.test(s.text)) errors.push(`${name} has Korean: ${s.text}`);
        }
    };

    checkS(p.on_sentence, 'on_sentence');
    checkS(p.kun_sentence, 'kun_sentence');
    checkArrayNeeded(p.on_sentence, p.on_reading);
    checkArrayNeeded(p.kun_sentence, p.kun_reading);

    p.examples.forEach((ex, i) => {
        if (krRegex.test(ex.word)) errors.push(`example[${i}].word has Korean: ${ex.word}`);
        if (krRegex.test(ex.reading)) errors.push(`example[${i}].reading has Korean: ${ex.reading}`);
    });

    if (krRegex.test(p.on_reading)) errors.push(`on_reading has Korean: ${p.on_reading}`);
    if (krRegex.test(p.kun_reading)) errors.push(`kun_reading has Korean: ${p.kun_reading}`);

    return { id: p.id, kanji: p.kanji, category: p.category, errors };
}).filter(r => r.errors.length > 0);

console.log(JSON.stringify(report, null, 2));
console.log(`Total N1/N2 items checked: ${data.filter(p => p.category === 'N2' || p.category === 'N1').length}`);
console.log(`Items with errors: ${report.length}`);
