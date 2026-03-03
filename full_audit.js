import fs from 'fs';
const path = 'src/data/kanjiData.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const krRegex = /[가-힣]/;

const report = data.map(p => {
    const issues = [];

    const onReadings = p.on_reading.split(/[,/]/).filter(r => r && r !== '-' && r !== '');
    const kunReadings = p.kun_reading.split(/[,/]/).filter(r => r && r !== '-' && r !== '');

    // 1. Array check
    if (onReadings.length > 1 && !Array.isArray(p.on_sentence)) {
        issues.push(`on_sentence should be Array (readings: ${onReadings.join(', ')})`);
    } else if (Array.isArray(p.on_sentence) && p.on_sentence.length < onReadings.length) {
        issues.push(`on_sentence missing examples (found ${p.on_sentence.length}, need ${onReadings.length})`);
    }

    if (kunReadings.length > 1 && !Array.isArray(p.kun_sentence)) {
        issues.push(`kun_sentence should be Array (readings: ${kunReadings.join(', ')})`);
    } else if (Array.isArray(p.kun_sentence) && p.kun_sentence.length < kunReadings.length) {
        issues.push(`kun_sentence missing examples (found ${p.kun_sentence.length}, need ${kunReadings.length})`);
    }

    // 2. Korean check
    const checkKR = (obj, field) => {
        if (!obj) return;
        if (Array.isArray(obj)) {
            obj.forEach((item, i) => {
                if (krRegex.test(item[field])) issues.push(`${field}[${i}] has Korean: ${item[field]}`);
            });
        } else {
            if (krRegex.test(obj[field])) issues.push(`${field} has Korean: ${obj[field]}`);
        }
    };

    checkKR(p.on_sentence, 'text');
    checkKR(p.kun_sentence, 'text');
    p.examples.forEach((ex, i) => {
        if (krRegex.test(ex.word)) issues.push(`example[${i}].word has Korean: ${ex.word}`);
        if (krRegex.test(ex.reading)) issues.push(`example[${i}].reading has Korean: ${ex.reading}`);
    });

    // 3. Label check
    p.examples.forEach((ex, i) => {
        if (!ex.mean.includes('(음독)') && !ex.mean.includes('(훈독)')) {
            issues.push(`example[${i}] missing label: ${ex.mean}`);
        }
    });

    if (issues.length > 0) {
        return { id: p.id, kanji: p.kanji, category: p.category, issues };
    }
    return null;
}).filter(x => x !== null);

console.log(JSON.stringify(report, null, 2));
console.log(`\nTotal items with issues: ${report.length} / ${data.length}`);
